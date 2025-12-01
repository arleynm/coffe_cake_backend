import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUnidadeUseCase } from '../../../application/use-cases/unidade/create-unidade.usecase';
import { ListUnidadesUseCase } from '../../../application/use-cases/unidade/list-unidades.usecase';
import { UpdateUnidadeUseCase } from '../../../application/use-cases/unidade/update-unidade.usecase';
import { DeleteUnidadeUseCase } from '../../../application/use-cases/unidade/delete-unidade.usecase';
import { CreateUnidadeDto, UpdateUnidadeDto } from '../dtos/unidade.dto';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';

@Controller('unidades')
export class UnidadeController {
  constructor(
    private createUC: CreateUnidadeUseCase,
    private listUC: ListUnidadesUseCase,
    private updateUC: UpdateUnidadeUseCase,
    private deleteUC: DeleteUnidadeUseCase,
    private repo: UnidadeRepository, // usar para GET /:id
  ) {}

  @Post()
  create(@Body() dto: CreateUnidadeDto) {
    return this.createUC.execute(dto);
  }

  @Get()
  list() {
    return this.listUC.execute();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUnidadeDto) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { success: true };
  }
}
