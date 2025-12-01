import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateInsumoUseCase } from '../../../application/use-cases/insumo/create-insumo.usecase';
import { ListInsumosUseCase } from '../../../application/use-cases/insumo/list-insumos.usecase';
import { UpdateInsumoUseCase } from '../../../application/use-cases/insumo/update-insumo.usecase';
import { ToggleInsumoUseCase } from '../../../application/use-cases/insumo/toggle-insumo.usecase';
import { CreateInsumoDto, ListInsumosQueryDto, ToggleInsumoDto, UpdateInsumoDto } from '../dtos/insumo.dto'; 
import { InsumoRepository } from '../../../domain/estoque/repositories/insumo.repository';

@Controller('insumos')
export class InsumoController {
  constructor(
    private createUC: CreateInsumoUseCase,
    private listUC: ListInsumosUseCase,
    private updateUC: UpdateInsumoUseCase,
    private toggleUC: ToggleInsumoUseCase,
    private repo: InsumoRepository,
  ) {}

  @Post()
  create(@Body() dto: CreateInsumoDto) {
    return this.createUC.execute(dto);
  }

  @Get()
  list(@Query() q: ListInsumosQueryDto) {
    const onlyActive =
      typeof q.onlyActive === 'boolean'
        ? q.onlyActive
        : undefined;
    return this.listUC.execute({ search: q.search, onlyActive });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
    return this.updateUC.execute(id, dto);
  }

  @Patch(':id/ativo')
  toggle(@Param('id') id: string, @Body() dto: ToggleInsumoDto) {
    return this.toggleUC.execute(id, dto.ativo);
  }
}
