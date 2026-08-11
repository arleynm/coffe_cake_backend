// src/infra/http/controllers/produto.controller.ts
import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, Req
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { z } from 'zod';

import { CreateProduto } from '../../../application/use-cases/produto/create-produto.use-case';
import { UpdateProduto } from '../../../application/use-cases/produto/update-produto.use-case';
import { DeleteProduto } from '../../../application/use-cases/produto/delete-produto.use-case';
import { GetProduto } from '../../../application/use-cases/produto/get-produto.use-case';
import { ListProdutos } from '../../../application/use-cases/produto/list-produtos.use-case';
import { CreateProdutoDto } from '../dtos/create-produto.dto';
import { UpdateProdutoDto, IdParamDto } from '../dtos/update-produto.dto';
import { QueryProdutoDto } from '../dtos/query-produto.dto';
import { Public } from '../../auth/public.decorator';
import { PrismaService } from '../../db/prisma.service';
import { MenuEventsService } from '../../../menu/menu-events.service';

// -------- schemas para campos complexos enviados como JSON (tamanhos/adicionais)
const TamanhoSchema = z.object({
  tamanho: z.enum(['P','M','G']),
  acrescimo: z.coerce.number(),
});
const TamanhosSchema = z.array(TamanhoSchema);

const AdicionalSchema = z.object({
  nome: z.string(),
  preco: z.coerce.number(),
  ativo: z.coerce.boolean().optional(),
});
const AdicionaisSchema = z.array(AdicionalSchema);

const FichaTecnicaItemSchema = z.object({
  insumoId: z.string().min(1),
  quantidade: z.coerce.number().positive(),
});
const FichaTecnicaSchema = z.array(FichaTecnicaItemSchema);

// -------- helpers de coerção
function fieldToString(v: unknown): string | undefined {
  if (v == null) return undefined;

  // 👇 fastify-multipart frequentemente entrega Buffer para campos
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
    return v.toString('utf8').trim();
  }

  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);

  // alguns adaptadores mandam { value: '...' }
  if (typeof v === 'object' && v && 'value' in (v as any) && typeof (v as any).value === 'string') {
    return String((v as any).value).trim();
  }

  return undefined;
}

function toNullableNumber(v?: string): number | null {
  if (v == null || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toNumber(v?: string, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function toBool(v?: string, def = true): boolean {
  if (v == null) return def;
  return String(v) !== 'false';
}
function json<T>(v?: string, schema?: z.ZodType<T>): T | undefined {
  if (!v) return undefined;
  try {
    const parsed = JSON.parse(v) as T;
    if (!schema) return parsed;
    const r = schema.safeParse(parsed);
    return r.success ? r.data : undefined;
  } catch { return undefined; }
}

// -------- salva stream do arquivo e retorna dados
async function saveStreamToUploads(
  stream: NodeJS.ReadableStream,
  originalName: string,
): Promise<{ url: string; path: string; filename: string; mimetype?: string; sizeBytes?: number; }> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try { await stat(uploadsDir); } catch { await mkdir(uploadsDir, { recursive: true }); }

  const ext = extname(originalName || '') || '.bin';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const absPath = join(uploadsDir, unique);

  await pipeline(stream, createWriteStream(absPath));
  const url = `/uploads/${unique}`; 

  return { url, path: absPath, filename: originalName || unique };
}

async function readMultipart(req: FastifyRequest) {
  const fields: Record<string, string> = {};
  let savedFile: { url: string; path: string; filename: string; mimetype?: string; sizeBytes?: number } | null = null;

  const parts = (req as any).parts();

  for await (const part of parts) {
    if (part.type === 'file') {
      if (part.fieldname === 'file' && !savedFile) {
        const saved = await saveStreamToUploads(part.file, part.filename);
        savedFile = { ...saved, mimetype: part.mimetype };
      } else {
        // descarta arquivos extras
        part.file.resume();
      }
    } else {
      const s = fieldToString(part.value);
      if (s !== undefined) fields[part.fieldname] = s;
    }
  }

  return { fields, savedFile };
}

@Controller('produtos')
export class ProdutoController {
  constructor(
    private readonly createUC: CreateProduto,
    private readonly updateUC: UpdateProduto,
    private readonly deleteUC: DeleteProduto,
    private readonly getUC: GetProduto,
    private readonly listUC: ListProdutos,
    private readonly prisma: PrismaService,
    private readonly menuEvents: MenuEventsService,
  ) {}

  /** Promoção do dia atual (público — usado no card da sidebar/cardápio). */
  @Public()
  @Get('promocao')
  async promocao() {
    const p = await this.prisma.produto.findFirst({
      where: { promocaoAtiva: true, ativo: true },
      include: { categoria: true },
    });
    if (!p) return null;
    return {
      id: p.id,
      nome: p.nome,
      categoria: p.categoria?.nome ?? null,
      preco: Number(p.promocaoPreco ?? p.precoVenda),
      precoOriginal: Number(p.precoVenda),
      imagemUrl: p.imagemUrl,
    };
  }

  /** Define/remove a promoção do dia (apenas 1 por vez). */
  @Put(':id/promocao')
  async setPromocao(@Param() { id }: IdParamDto, @Body() body: { ativa?: boolean; preco?: number | null }) {
    if (body?.ativa) {
      await this.prisma.$transaction([
        this.prisma.produto.updateMany({ where: { promocaoAtiva: true }, data: { promocaoAtiva: false } }),
        this.prisma.produto.update({
          where: { id },
          data: { promocaoAtiva: true, promocaoPreco: body.preco != null ? Number(body.preco) : null },
        }),
      ]);
    } else {
      await this.prisma.produto.update({ where: { id }, data: { promocaoAtiva: false } });
    }
    this.menuEvents.emit('menu.promocao', { id, ativa: !!body?.ativa });
    return { ok: true };
  }

  @Post()
  async create(@Req() req: FastifyRequest) {
    const { fields, savedFile } = await readMultipart(req);

    const tamanhos   = json(fields.tamanhos, TamanhosSchema);
    const adicionais = json(fields.adicionais, AdicionaisSchema);
    const fichaTecnica = json(fields.fichaTecnica, FichaTecnicaSchema);

    console.log('[POST /produtos] fields =', fields);


    const input: CreateProdutoDto = {
      nome: fields.nome ?? '',
      categoriaId: (fields.categoriaId ?? '').trim(),
      descricao: fields.descricao ?? null,
      precoCusto: toNullableNumber(fields.precoCusto),
      precoVenda: toNumber(fields.precoVenda, 0),
      ativo: toBool(fields.ativo, true),
      exibirNoCardapio: toBool(fields.exibirNoCardapio, true),
      imageId: null,
      imagemUrl: savedFile ? savedFile.url : (fields.imagemUrl || null),
      tamanhos,
      adicionais,
      fichaTecnica,
    };


    const p = await this.createUC.exec(input);
    this.menuEvents.emit('produto.created', { id: (p as any)?.id ?? null });
    return { data: p };
  }

  @Put(':id')
  async update(@Param() { id }: IdParamDto, @Req() req: FastifyRequest) {
    const { fields, savedFile } = await readMultipart(req);

    const patch: UpdateProdutoDto = {};
    const tamanhos   = json(fields.tamanhos, TamanhosSchema);
    const adicionais = json(fields.adicionais, AdicionaisSchema);
    const fichaTecnica = json(fields.fichaTecnica, FichaTecnicaSchema);

    if (fields.nome !== undefined) patch.nome = fields.nome;
    if (fields.categoriaId !== undefined) patch.categoriaId = fields.categoriaId;
    if (fields.descricao !== undefined) patch.descricao = fields.descricao || null;
    if (fields.precoCusto !== undefined) patch.precoCusto = toNullableNumber(fields.precoCusto);
    if (fields.precoVenda !== undefined) patch.precoVenda = toNumber(fields.precoVenda);
    if (fields.ativo !== undefined) patch.ativo = toBool(fields.ativo);
    if (fields.exibirNoCardapio !== undefined) patch.exibirNoCardapio = toBool(fields.exibirNoCardapio);
    if (tamanhos !== undefined) patch.tamanhos = tamanhos;
    if (adicionais !== undefined) patch.adicionais = adicionais;
    if (fichaTecnica !== undefined) patch.fichaTecnica = fichaTecnica;

    if (savedFile) {
      patch.imageId = undefined;
      patch.imagemUrl = savedFile.url;
    } else if (fields.imagemUrl !== undefined) {
      patch.imagemUrl = fields.imagemUrl ? fields.imagemUrl : null;
    }

    const p = await this.updateUC.exec({ id, patch });
    this.menuEvents.emit('produto.updated', { id });
    return { data: p };
  }

  @Delete(':id')
  async delete(@Param() { id }: IdParamDto) {
    await this.deleteUC.exec(id);
    this.menuEvents.emit('produto.deleted', { id });
    return { ok: true };
  }

  @Public()
  @Get(':id')
  async get(@Param() { id }: IdParamDto) {
    const p = await this.getUC.exec(id);
    return { data: p };
  }

  @Public()
  @Get()
  async list(@Query() q: QueryProdutoDto) {
    const res = await this.listUC.exec({
      q: q.q,
      categoriaId: q.categoriaId,
      ativo: q.ativo === undefined ? undefined : q.ativo === 'true',
      exibirNoCardapio: q.exibirNoCardapio === undefined ? undefined : q.exibirNoCardapio === 'true',
      page: q.page ?? 1,
      pageSize: q.pageSize ?? 20,
      orderBy: q.orderBy ?? 'nome',
      orderDir: q.orderDir ?? 'asc',
    });
    return { data: res.items, meta: { total: res.total } };
  }
}
