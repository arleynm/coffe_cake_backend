import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateDepositoDto, UpdateDepositoDto, UpdateDepositoStatusDto } from '../dtos/deposito.dto';
import { CreateDepositoUseCase } from '../../../application/use-cases/deposito/create-deposito.usecase';
import { ListDepositosUseCase } from '../../../application/use-cases/deposito/list-depositos.usecase';
import { GetDepositoUseCase } from '../../../application/use-cases/deposito/get-deposito.usecase';
import { UpdateDepositoUseCase } from '../../../application/use-cases/deposito/update-deposito.usecase';
import { UpdateStatusDepositoUseCase } from '../../../application/use-cases/deposito/update-status-deposito.usecase';

@Controller('depositos')
export class DepositoController {
  constructor(
    private createUC: CreateDepositoUseCase,
    private listUC: ListDepositosUseCase,
    private getUC: GetDepositoUseCase,
    private updateUC: UpdateDepositoUseCase,
    private statusUC: UpdateStatusDepositoUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateDepositoDto) {
    return this.createUC.execute(dto);
  }

  @Get()
  list(@Query('onlyActive') onlyActive?: string) {
    return this.listUC.execute({ onlyActive: onlyActive === 'true' });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepositoDto) {
    return this.updateUC.execute(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDepositoStatusDto) {
    return this.statusUC.execute(id, dto.ativo);
  }
}
