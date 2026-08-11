import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, merge, map } from 'rxjs';
import { MenuEventsService } from './menu-events.service';
import { Public } from '../infra/auth/public.decorator';

@Controller('menu')
export class MenuEventsController {
  constructor(private readonly events: MenuEventsService) {}

  /** Stream público de mudanças do cardápio (produtos/categorias/promoção). */
  @Public()
  @Sse('events')
  stream(): Observable<MessageEvent> {
    const heartbeat$ = interval(15000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat' }) })),
    );

    const bus$ = this.events.stream$.pipe(
      map((event) => ({ data: JSON.stringify(event) })),
    );

    return merge(heartbeat$, bus$);
  }
}
