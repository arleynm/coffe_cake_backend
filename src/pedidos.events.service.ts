import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type PedidoEventType =
  | 'pedido.created'
  | 'pedido.updated'
  | 'pedido.deleted';

export type PedidoEvent = {
  type: PedidoEventType;
  data: any;
};

type PedidoEventHandler = (event: PedidoEvent) => void | Promise<void>;

@Injectable()
export class PedidosEventsService {
  private readonly subject = new Subject<PedidoEvent>();
  readonly stream$: Observable<PedidoEvent> = this.subject.asObservable();

  private handlers: Partial<Record<PedidoEventType, PedidoEventHandler[]>> = {};

  on(eventType: PedidoEventType, handler: PedidoEventHandler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }

    this.handlers[eventType]!.push(handler);
  }

  async emit(event: PedidoEvent) {
    console.log('[PedidosEventsService] emit:', event.type, event.data);

    this.subject.next(event);

    const listeners = this.handlers[event.type] ?? [];

    await Promise.allSettled(
      listeners.map((handler) => Promise.resolve(handler(event))),
    );
  }
}