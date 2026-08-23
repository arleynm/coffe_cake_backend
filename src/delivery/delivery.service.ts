import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/db/prisma.service';
import { DeliveryEventsService } from './delivery-events.service';

type ZoneInput = {
  nome: string;
  bairros?: string[];
  prefixosCep?: string[];
  taxa: number;
  pedidoMinimo?: number;
  tempoMinimo?: number | null;
  tempoMaximo?: number | null;
  ativa?: boolean;
  ordem?: number;
  poligono?: unknown;
  raioMetros?: number | null;
  cor?: string;
};

@Injectable()
export class DeliveryService {
  private readonly geocodeCache = new Map<string, { latitude: number; longitude: number; displayName: string }>();
  constructor(private readonly prisma: PrismaService, private readonly events: DeliveryEventsService) {}

  async config() {
    return this.prisma.deliveryConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });
  }

  async publicState() {
    const [config, zones] = await Promise.all([
      this.config(),
      this.prisma.deliveryZone.findMany({ where: { ativa: true }, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    ]);
    return { config, zones: zones.map(this.serializeZone) };
  }

  async updateConfig(input: Record<string, unknown>) {
    const data = {
      deliveryAtivo: input.deliveryAtivo == null ? undefined : Boolean(input.deliveryAtivo),
      lojaAberta: input.lojaAberta == null ? undefined : Boolean(input.lojaAberta),
      retiradaAtiva: input.retiradaAtiva == null ? undefined : Boolean(input.retiradaAtiva),
      tempoMinimo: input.tempoMinimo == null ? undefined : Number(input.tempoMinimo),
      tempoMaximo: input.tempoMaximo == null ? undefined : Number(input.tempoMaximo),
      pedidoMinimo: input.pedidoMinimo == null ? undefined : Number(input.pedidoMinimo),
      lojaLatitude: input.lojaLatitude == null || input.lojaLatitude === '' ? undefined : Number(input.lojaLatitude),
      lojaLongitude: input.lojaLongitude == null || input.lojaLongitude === '' ? undefined : Number(input.lojaLongitude),
      mapaZoom: input.mapaZoom == null ? undefined : Number(input.mapaZoom),
      cobrarPorKm: input.cobrarPorKm == null ? undefined : Boolean(input.cobrarPorKm),
      taxaBaseKm: input.taxaBaseKm == null || input.taxaBaseKm === '' ? undefined : Number(input.taxaBaseKm),
      precoPorKm: input.precoPorKm == null || input.precoPorKm === '' ? undefined : Number(input.precoPorKm),
    };
    const config = await this.prisma.deliveryConfig.upsert({ where: { id: 'default' }, create: { id: 'default', ...data }, update: data });
    this.events.emit('delivery.config.updated', config);
    return config;
  }

  async listZones() {
    const zones = await this.prisma.deliveryZone.findMany({ orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] });
    return zones.map(this.serializeZone);
  }

  async createZone(input: ZoneInput) {
    this.validateZone(input);
    const zone = await this.prisma.deliveryZone.create({ data: this.zoneData(input) });
    this.events.emit('delivery.zones.updated', { id: zone.id });
    return this.serializeZone(zone);
  }

  async updateZone(id: string, input: Partial<ZoneInput>) {
    const existing = await this.prisma.deliveryZone.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Zona de entrega não encontrada');
    const merged: ZoneInput = { ...this.serializeZone(existing), ...input } as ZoneInput;
    this.validateZone(merged);
    const zone = await this.prisma.deliveryZone.update({ where: { id }, data: this.zoneData(merged) });
    this.events.emit('delivery.zones.updated', { id });
    return this.serializeZone(zone);
  }

  async removeZone(id: string) {
    await this.prisma.deliveryZone.delete({ where: { id } });
    this.events.emit('delivery.zones.updated', { id });
    return { ok: true };
  }

  async quote(input: { cep?: string; bairro?: string; rua?: string; numero?: string; cidade?: string; uf?: string; latitude?: number; longitude?: number; subtotal?: number }) {
    const state = await this.publicState();
    if (!state.config.deliveryAtivo || !state.config.lojaAberta) throw new BadRequestException('Delivery fechado no momento');
    let latitude = Number(input.latitude);
    let longitude = Number(input.longitude);
    let resolvedAddress = '';
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      const geo = await this.geocode(input);
      latitude = geo.latitude;
      longitude = geo.longitude;
      resolvedAddress = geo.displayName;
    }
    // 1) Zonas por raio (estilo iFood): anel concêntrico à loja que contém o ponto — o menor raio vence.
    const storeLat = Number(state.config.lojaLatitude);
    const storeLng = Number(state.config.lojaLongitude);
    let circleZone: any = null;
    let distanciaMetros: number | null = null;
    if (Number.isFinite(storeLat) && Number.isFinite(storeLng)) {
      distanciaMetros = this.haversineMeters(storeLat, storeLng, latitude, longitude);
      circleZone = state.zones
        .filter((z) => z.raioMetros && distanciaMetros! <= Number(z.raioMetros))
        .sort((a, b) => Number(a.raioMetros) - Number(b.raioMetros))[0] ?? null;
    }
    // 2) Fallbacks: polígono desenhado, depois bairro/CEP
    const polygonZones = state.zones.filter((z) => z.poligono && this.pointInGeoJson(longitude, latitude, z.poligono));
    const cep = this.normalizeCep(input.cep);
    const bairro = this.normalizeText(input.bairro);
    const zone = circleZone ?? polygonZones[0] ?? state.zones.find((z) => !z.poligono && !z.raioMetros && ((cep && z.prefixosCep.some((p: string) => cep.startsWith(this.normalizeCep(p)))) || (bairro && z.bairros.some((b: string) => this.normalizeText(b) === bairro))));
    if (!zone) throw new NotFoundException('Endereço fora da área de entrega');

    // Distância REAL pelas ruas (para exibir e para o preço por km)
    let distanciaRuaMetros: number | null = null;
    if (Number.isFinite(storeLat) && Number.isFinite(storeLng)) {
      distanciaRuaMetros = await this.rotaRealMetros(storeLat, storeLng, latitude, longitude);
    }

    // Preço: por km rodado (real) quando ativado; senão, a taxa fixa da zona
    let taxa = Number(zone.taxa);
    if (state.config.cobrarPorKm && distanciaRuaMetros != null) {
      const km = distanciaRuaMetros / 1000;
      taxa = Number((Number(state.config.taxaBaseKm) + km * Number(state.config.precoPorKm)).toFixed(2));
    }

    const minimo = Math.max(Number(state.config.pedidoMinimo), Number(zone.pedidoMinimo));
    return {
      atendido: true,
      zone,
      latitude,
      longitude,
      enderecoResolvido: resolvedAddress,
      distanciaMetros: distanciaRuaMetros ?? distanciaMetros, // distância pelas ruas quando disponível
      distanciaKm: distanciaRuaMetros != null ? Number((distanciaRuaMetros / 1000).toFixed(1)) : null,
      cobrarPorKm: !!state.config.cobrarPorKm,
      taxa,
      pedidoMinimo: minimo,
      valorMinimoAtingido: Number(input.subtotal ?? 0) >= minimo,
      tempoMinimo: zone.tempoMinimo ?? state.config.tempoMinimo,
      tempoMaximo: zone.tempoMaximo ?? state.config.tempoMaximo,
    };
  }

  /** Geocodifica o endereço da loja e salva lat/lng na config (define o centro dos anéis). */
  async setLojaEndereco(input: { cep?: string; bairro?: string; rua?: string; numero?: string; cidade?: string; uf?: string }) {
    const geo = await this.geocode(input);
    const endereco = {
      lojaLatitude: geo.latitude,
      lojaLongitude: geo.longitude,
      lojaCep: input.cep ?? undefined,
      lojaRua: input.rua ?? undefined,
      lojaNumero: input.numero ?? undefined,
      lojaBairro: input.bairro ?? undefined,
      lojaCidade: input.cidade ?? undefined,
      lojaUf: input.uf ?? undefined,
    };
    const config = await this.prisma.deliveryConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...endereco },
      update: endereco,
    });
    this.events.emit('delivery.config.updated', config);
    return { config, latitude: geo.latitude, longitude: geo.longitude, enderecoResolvido: geo.displayName };
  }

  /** Remove o endereço/localização salvos da loja. */
  async clearLojaEndereco() {
    const config = await this.prisma.deliveryConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {
        lojaLatitude: null,
        lojaLongitude: null,
        lojaCep: null,
        lojaRua: null,
        lojaNumero: null,
        lojaBairro: null,
        lojaCidade: null,
        lojaUf: null,
      },
    });
    this.events.emit('delivery.config.updated', config);
    return config;
  }

  /** Gera anéis concêntricos (estilo iFood) a partir da loja. Substitui as zonas por raio existentes. */
  async gerarZonasAutomaticas(input: { quantidade?: number; raioBaseKm?: number; incrementoKm?: number; taxaBase?: number; incrementoTaxa?: number; pedidoMinimo?: number; tempoMinimo?: number | null; tempoMaximo?: number | null }) {
    const cfg = await this.config();
    if (cfg.lojaLatitude == null || cfg.lojaLongitude == null) throw new BadRequestException('Defina o endereço da loja antes de gerar as zonas.');
    const qtd = Math.min(Math.max(Math.round(Number(input.quantidade) || 3), 1), 8);
    const raioBase = Number(input.raioBaseKm) || 2;
    const inc = Number(input.incrementoKm) || 2;
    const taxaBase = Number(input.taxaBase) || 5;
    const incTaxa = Number(input.incrementoTaxa ?? 3);
    const cores = ['#2e9e5b', '#8bbf3c', '#e0b400', '#e08a00', '#e05a00', '#d63b3b', '#a23bd6', '#3b6dd6'];

    // remove zonas por raio anteriores para não acumular
    await this.prisma.deliveryZone.deleteMany({ where: { NOT: [{ raioMetros: null }] } });

    const criadas: any[] = [];
    for (let i = 0; i < qtd; i++) {
      const raioKm = raioBase + inc * i;
      const taxa = taxaBase + incTaxa * i;
      const zone = await this.prisma.deliveryZone.create({
        data: {
          nome: `Até ${Number.isInteger(raioKm) ? raioKm : raioKm.toFixed(1)} km`,
          bairros: [],
          prefixosCep: [],
          raioMetros: Math.round(raioKm * 1000),
          taxa,
          pedidoMinimo: Number(input.pedidoMinimo ?? 0),
          tempoMinimo: input.tempoMinimo ?? null,
          tempoMaximo: input.tempoMaximo ?? null,
          cor: cores[i % cores.length],
          ativa: true,
          ordem: i,
        },
      });
      criadas.push(this.serializeZone(zone));
    }
    this.events.emit('delivery.zones.updated', { generated: qtd });
    return criadas;
  }

  async geocode(input: { cep?: string; bairro?: string; rua?: string; numero?: string; cidade?: string; uf?: string }) {
    if (!input.cidade?.trim() && !input.cep?.trim()) {
      throw new BadRequestException('Informe ao menos CEP ou cidade e estado.');
    }

    const cep = String(input.cep ?? '').replace(/\D/g, '');
    const ruaNum = input.rua ? `${input.rua}${input.numero ? `, ${input.numero}` : ''}` : '';

    // do mais específico ao mais genérico — a primeira busca que retornar vence
    const tentativas = [
      [ruaNum, input.cidade, input.uf, 'Brasil'],           // rua + nº + cidade + uf (ponto ótimo do Nominatim)
      [input.rua, input.cidade, input.uf, 'Brasil'],        // rua (sem nº) + cidade + uf
      [input.bairro, input.cidade, input.uf, 'Brasil'],     // bairro + cidade + uf
      [cep, input.cidade, 'Brasil'],                        // cep + cidade
      [input.cidade, input.uf, 'Brasil'],                   // só cidade + uf (centro)
    ]
      .map((parts) => parts.filter(Boolean).join(', '))
      .filter((q) => q.replace(/,/g, '').trim().length >= 4);

    const vistos = new Set<string>();
    let indisponivel = false;
    for (let i = 0; i < tentativas.length; i++) {
      const q = tentativas[i];
      if (vistos.has(q)) continue;
      vistos.add(q);
      const r = await this.buscarNominatim(q);
      if (r === 'error') { indisponivel = true; continue; }
      if (r) return r;
      // pausa curta entre tentativas para respeitar o limite do Nominatim (1 req/s)
      if (i < tentativas.length - 1) await new Promise((res) => setTimeout(res, 350));
    }

    if (indisponivel) throw new BadRequestException('Serviço de localização indisponível. Tente novamente em instantes.');
    throw new NotFoundException('Endereço não encontrado. Confira os dados informados.');
  }

  /** Consulta o Nominatim; retorna o resultado, null (não achou) ou 'error' (serviço indisponível). */
  private async buscarNominatim(query: string): Promise<{ latitude: number; longitude: number; displayName: string } | null | 'error'> {
    const cached = this.geocodeCache.get(query);
    if (cached) return cached;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'br');
      url.searchParams.set('addressdetails', '1');
      const response = await fetch(url, {
        headers: { 'User-Agent': 'CoffeeCake/1.0 (delivery address lookup)', 'Accept-Language': 'pt-BR' },
        signal: controller.signal,
      });
      if (!response.ok) return 'error';
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (!results[0]) return null;
      const result = { latitude: Number(results[0].lat), longitude: Number(results[0].lon), displayName: results[0].display_name };
      this.geocodeCache.set(query, result);
      return result;
    } catch {
      return 'error';
    } finally {
      clearTimeout(timer);
    }
  }

  private normalizeText(value?: string) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); }
  private normalizeCep(value?: string) { return String(value ?? '').replace(/\D/g, ''); }
  private validateZone(input: ZoneInput) { if (!input.nome?.trim()) throw new BadRequestException('Informe o nome da zona'); if (Number(input.taxa) < 0) throw new BadRequestException('Taxa inválida'); if (!input.poligono && !(Number(input.raioMetros) > 0) && !(input.bairros?.length || input.prefixosCep?.length)) throw new BadRequestException('Defina um raio ou desenhe a zona no mapa'); }
  private zoneData(input: ZoneInput) { return { nome: input.nome.trim(), bairros: input.bairros ?? [], prefixosCep: input.prefixosCep ?? [], poligono: input.poligono as any ?? undefined, raioMetros: input.raioMetros != null ? Math.round(Number(input.raioMetros)) : null, cor: input.cor ?? '#b65d24', taxa: Number(input.taxa), pedidoMinimo: Number(input.pedidoMinimo ?? 0), tempoMinimo: input.tempoMinimo ?? null, tempoMaximo: input.tempoMaximo ?? null, ativa: input.ativa ?? true, ordem: Number(input.ordem ?? 0) }; }
  private serializeZone(zone: any) { return { ...zone, taxa: Number(zone.taxa), pedidoMinimo: Number(zone.pedidoMinimo), raioMetros: zone.raioMetros != null ? Number(zone.raioMetros) : null, bairros: Array.isArray(zone.bairros) ? zone.bairros : [], prefixosCep: Array.isArray(zone.prefixosCep) ? zone.prefixosCep : [] }; }
  private haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  /**
   * Distância REAL pelas ruas (rota de moto/carro) via OSRM (OpenStreetMap, gratuito).
   * Se o serviço falhar, cai para a linha reta × 1.3 (fator médio de "volta" das ruas).
   */
  private async rotaRealMetros(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<number> {
    const reta = this.haversineMeters(fromLat, fromLng, toLat, toLng);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
      const res = await fetch(url, { headers: { 'User-Agent': 'CoffeeCake/1.0 (delivery route)' }, signal: controller.signal });
      if (!res.ok) return Math.round(reta * 1.3);
      const data = (await res.json()) as { code?: string; routes?: Array<{ distance?: number }> };
      const dist = data?.routes?.[0]?.distance;
      if (data?.code !== 'Ok' || !(Number(dist) > 0)) return Math.round(reta * 1.3);
      return Math.round(Number(dist));
    } catch {
      return Math.round(reta * 1.3);
    } finally {
      clearTimeout(timer);
    }
  }
  private pointInGeoJson(lng: number, lat: number, geo: any) {
    const geometry = geo?.type === 'Feature' ? geo.geometry : geo;
    const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : [];
    return polygons.some((polygon: number[][][]) => this.pointInRing(lng, lat, polygon[0]));
  }
  private pointInRing(x: number, y: number, ring: number[][]) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside; }
    return inside;
  }
}
