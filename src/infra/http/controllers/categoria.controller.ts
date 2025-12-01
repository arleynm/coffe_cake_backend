import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateCategoriaUseCase } from '../../../application/use-cases/categoria/create-categoria.usecase';
import { UpdateCategoriaUseCase } from '../../../application/use-cases/categoria/update-categoria.usecase';
import { GetCategoriaUseCase } from '../../../application/use-cases/categoria/get-categoria.usecase';
import { ListCategoriasUseCase } from '../../../application/use-cases/categoria/list-categorias.usecase';
import { DeleteCategoriaUseCase } from '../../../application/use-cases/categoria/delete-categoria.usecase';
import { CreateCategoriaDto } from '../../http/dtos/create-categoria.dto';
import { UpdateCategoriaDto, IdParamDto } from '../../http/dtos/update-categoria.dto';
import { QueryCategoriaDto } from '../../http/dtos/query-categoria.dto';

@Controller('categorias')
export class CategoriaController {
  constructor(
    private readonly createUC: CreateCategoriaUseCase,
    private readonly updateUC: UpdateCategoriaUseCase,
    private readonly getUC: GetCategoriaUseCase,
    private readonly listUC: ListCategoriasUseCase,
    private readonly deleteUC: DeleteCategoriaUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCategoriaDto) {
    const c = await this.createUC.exec(dto);
    return { data: c };
  }

  @Put(':id')
  async update(@Param() { id }: IdParamDto, @Body() dto: UpdateCategoriaDto) {
    const c = await this.updateUC.exec({ id, patch: dto });
    return { data: c };
  }

  @Get(':id')
  async get(@Param() { id }: IdParamDto) {
    const c = await this.getUC.exec(id);
    return { data: c };
  }

  @Get()
  async list(@Query() q: QueryCategoriaDto) {
    const res = await this.listUC.exec({
      q: q.q,
      ativo: q.ativo === undefined ? undefined : q.ativo === 'true',
      page: q.page ?? 1,
      pageSize: q.pageSize ?? 50,
      orderBy: q.orderBy ?? 'ordem',
      orderDir: q.orderDir ?? 'asc',
    });
    return { data: res.items, meta: { total: res.total } };
  }

  @Delete(':id')
  async delete(@Param() { id }: IdParamDto) {
    await this.deleteUC.exec(id);
    return { ok: true };
  }
}
