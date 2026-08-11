import { Controller, Sse, MessageEvent, Query } from '@nestjs/common';
import { Observable, interval, merge, map, filter } from 'rxjs';
import { PedidosEventsService } from '../../../pedidos.events.service';
import { Public } from '../../auth/public.decorator';

@Controller('pedidos')
export class PedidosEventsController {
  constructor(private readonly eventBus: PedidosEventsService) {}

  @Public()
  @Sse('events')
  events(@Query('mesa') mesa?: string, @Query('id') id?: string): Observable<MessageEvent> {
    const mesaStr = mesa != null ? String(mesa) : undefined;
    const idStr = id != null && id !== '' ? String(id) : undefined;

    const heartbeat$ = interval(15000).pipe(
      map(() => ({
        data: JSON.stringify({ type: 'heartbeat', data: '💓' }),
      })),
    );

    const bus$ = this.eventBus.stream$.pipe(
      filter((evt: any) => {
        // Acompanhamento de um pedido específico (página pública do cliente)
        if (idStr) {
          const evtId = evt?.data?.id ?? evt?.id ?? evt?.payload?.id;
          return String(evtId ?? '') === idStr;
        }

        if (!mesaStr) return true;

        const evtMesa =
          evt?.data?.mesa ??
          evt?.mesa ??
          evt?.payload?.mesa;

        return String(evtMesa ?? '') === mesaStr;
      }),
      map((evt) => ({
        data: JSON.stringify(evt),
      })),
    );

    return merge(heartbeat$, bus$);
  }
}