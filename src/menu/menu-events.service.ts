import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

/**
 * Barramento de eventos do cardápio (produtos, categorias e promoção do dia).
 * Consumido via SSE em GET /menu/events para atualizar o cardápio público
 * (e telas admin) em tempo real quando algo muda.
 */
@Injectable()
export class MenuEventsService {
  private readonly subject = new Subject<{ type: string; data: unknown }>();
  readonly stream$ = this.subject.asObservable();

  emit(type: string, data: unknown = null) {
    this.subject.next({ type, data });
  }
}
