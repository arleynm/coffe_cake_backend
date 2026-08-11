import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class DeliveryEventsService {
  private readonly subject = new Subject<{ type: string; data: unknown }>();
  readonly stream$ = this.subject.asObservable();

  emit(type: string, data: unknown) {
    this.subject.next({ type, data });
  }
}
