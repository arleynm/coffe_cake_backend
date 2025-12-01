import { IsBooleanString, IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProdutoDto {
  @IsString() @IsOptional()
  q?: string;

  @IsUUID() @IsOptional()
  categoriaId?: string;

  @IsBooleanString() @IsOptional()
  ativo?: string; // "true" | "false"

  @IsBooleanString() @IsOptional()
  exibirNoCardapio?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @IsPositive() @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @IsPositive() @IsOptional()
  pageSize?: number;

  @IsIn(['nome','createdAt','updatedAt','precoVenda']) @IsOptional()
  orderBy?: 'nome'|'createdAt'|'updatedAt'|'precoVenda';

  @IsIn(['asc','desc']) @IsOptional()
  orderDir?: 'asc'|'desc';
}
