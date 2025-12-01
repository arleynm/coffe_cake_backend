import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateLoteDto, ListLotesQueryDto, UpdateLoteDto } from '../dtos/lote.dto';
import { CreateLoteUseCase } from '../../../application/use-cases/lote/create-lote.usecase';
import { ListLotesUseCase } from '../../../application/use-cases/lote/list-lotes.usecase';
import { GetLoteUseCase } from '../../../application/use-cases/lote/get-lote.usecase';
import { UpdateLoteUseCase } from '../../../application/use-cases/lote/update-lote.usecase';

@Controller('lotes')
export class LoteController {
  constructor(
    private createUC: CreateLoteUseCase,
    private listUC: ListLotesUseCase,
    private getUC: GetLoteUseCase,
    private updateUC: UpdateLoteUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateLoteDto) {
    return this.createUC.execute(dto);
  }

  @Get()
  list(@Query() q: ListLotesQueryDto) {
    let vencendoAte: Date | undefined;
    if (q.vencendoEmDias) {
      const n = Number(q.vencendoEmDias);
      if (!isNaN(n) && n > 0) {
        vencendoAte = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
      }
    }
    return this.listUC.execute({
      insumoId: q.insumoId || undefined,
      depositoId: q.depositoId || undefined,
      vencendoAte,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLoteDto) {
    return this.updateUC.execute(id, dto);
  }
}
