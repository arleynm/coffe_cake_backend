import { Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Sse, UseGuards } from '@nestjs/common';
import { interval, map, merge, Observable } from 'rxjs';
import { JwtAuthGuard } from '../infra/auth/jwt.guard';
import { Public } from '../infra/auth/public.decorator';
import { DeliveryEventsService } from './delivery-events.service';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService, private readonly events: DeliveryEventsService) {}

  @Public() @Get('public') publicState() { return this.delivery.publicState(); }
  @Public() @Post('quote') quote(@Body() body: { cep?: string; bairro?: string; subtotal?: number }) { return this.delivery.quote(body); }
  @Public() @Post('geocode') geocode(@Body() body: { cep?: string; bairro?: string; rua?: string; numero?: string; cidade?: string; uf?: string }) { return this.delivery.geocode(body); }
  @Public() @Sse('events') stream(): Observable<MessageEvent> { return merge(this.events.stream$.pipe(map((event) => ({ data: JSON.stringify(event) }))), interval(15000).pipe(map(() => ({ data: JSON.stringify({ type: 'heartbeat' }) })))); }

  @UseGuards(JwtAuthGuard) @Get('admin') async admin() { return { config: await this.delivery.config(), zones: await this.delivery.listZones() }; }
  @UseGuards(JwtAuthGuard) @Patch('config') config(@Body() body: Record<string, unknown>) { return this.delivery.updateConfig(body); }
  @UseGuards(JwtAuthGuard) @Post('loja/geocode') setLoja(@Body() body: { cep?: string; bairro?: string; rua?: string; numero?: string; cidade?: string; uf?: string }) { return this.delivery.setLojaEndereco(body); }
  @UseGuards(JwtAuthGuard) @Delete('loja') clearLoja() { return this.delivery.clearLojaEndereco(); }
  @UseGuards(JwtAuthGuard) @Post('zones/gerar') gerar(@Body() body: any) { return this.delivery.gerarZonasAutomaticas(body); }
  @UseGuards(JwtAuthGuard) @Post('zones') createZone(@Body() body: any) { return this.delivery.createZone(body); }
  @UseGuards(JwtAuthGuard) @Patch('zones/:id') updateZone(@Param('id') id: string, @Body() body: any) { return this.delivery.updateZone(id, body); }
  @UseGuards(JwtAuthGuard) @Delete('zones/:id') removeZone(@Param('id') id: string) { return this.delivery.removeZone(id); }
}
