import { IsBooleanString, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCategoriaDto {
  @IsString() @IsOptional()
  q?: string;

  @IsBooleanString() @IsOptional()
  ativo?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @IsPositive() @IsOptional()
  page?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @IsPositive() @IsOptional()
  pageSize?: number;

  @IsIn(['nome','ordem','createdAt','updatedAt']) @IsOptional()
  orderBy?: 'nome'|'ordem'|'createdAt'|'updatedAt';

  @IsIn(['asc','desc']) @IsOptional()
  orderDir?: 'asc'|'desc';
}
