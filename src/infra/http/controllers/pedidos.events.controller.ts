import { Controller, Sse, MessageEvent, Query, UnauthorizedException } from '@nestjs/common';
import { Observable, interval, merge, map } from 'rxjs';
import { PedidosEventsService } from '../../../pedidos.events.service'; // <— caminho correto

@Controller('pedidos')
export class PedidosEventsController {
  // ⬇⬇⬇ renomeado para evitar conflito com o método
  constructor(private readonly eventBus: PedidosEventsService) {}

  @Sse('events')
  events(@Query('token') token?: string): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException('missing/invalid token');

    const heartbeat$ = interval(15000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat', data: '💓' }) }))
    );

    const bus$ = this.eventBus.stream$.pipe(
      map((evt) => ({ data: JSON.stringify(evt) }))
    );

    return merge(heartbeat$, bus$);
  }
}