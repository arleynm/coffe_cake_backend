// src/pedidos/pedidos.events.service.ts
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export type PedidoEvent =
  | { type: 'pedido.created'|'pedido.updated'|'pedido.status'|'pedido.deleted'|'heartbeat'; data: any };

@Injectable()
export class PedidosEventsService {
  private readonly subject = new Subject<PedidoEvent>();
  public readonly stream$ = this.subject.asObservable();

  emit(type: PedidoEvent['type'], data: any) {
    this.subject.next({ type, data });
  }
}
