import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EntradaUseCase } from '../../../application/use-cases/movimento/entrada.usecase';
import { SaidaUseCase } from '../../../application/use-cases/movimento/saida.usecase';
import { AjusteUseCase } from '../../../application/use-cases/movimento/ajuste.usecase';
import { TransferenciaUseCase } from '../../../application/use-cases/movimento/transferencia.usecase';
import { AjusteDto, EntradaDto, SaidaDto, SaldoQueryDto, TransferenciaDto } from '../dtos/movimento.dto';
import { MovimentoRepository } from 'src/domain/estoque/repositories/movimento.repository';

@Controller('movimentos')
export class MovimentoController {
  constructor(
    private entradaUC: EntradaUseCase,
    private saidaUC: SaidaUseCase,
    private ajusteUC: AjusteUseCase,
    private transferenciaUC: TransferenciaUseCase,
    private repo: MovimentoRepository, 
  ) {}

  @Post('entrada')
  entrada(@Body() dto: EntradaDto) {
    return this.entradaUC.execute(dto);
  }

  @Post('saida')
  saida(@Body() dto: SaidaDto) {
    return this.saidaUC.execute(dto);
  }

  @Post('ajuste')
  ajuste(@Body() dto: AjusteDto) {
    return this.ajusteUC.execute(dto);
  }

  @Post('transferencia')
  transferencia(@Body() dto: TransferenciaDto) {
    return this.transferenciaUC.execute(dto);
  }

  @Get('saldo')
  saldo(@Query() q: SaldoQueryDto) {
    return this.repo.getSaldo({
      insumoId: q.insumoId,
      depositoId: q.depositoId,
      loteId: q.loteId || undefined,
    });
  }
}
