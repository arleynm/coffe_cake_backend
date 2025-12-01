import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  nome!: string;

  @IsString() @IsOptional()
  slug?: string;

  @IsInt() @Min(0) @IsOptional()
  ordem?: number;

  @IsBoolean() @IsOptional()
  ativo?: boolean;
}
