import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProdutoDto {
  @IsString() @IsNotEmpty()
  nome!: string;

  // IDs são cuid (string), não UUID
  @IsString() @IsNotEmpty()
  categoriaId!: string;

  @IsString() @IsOptional()
  descricao?: string | null;

  @IsNumber() @Min(0) @IsOptional()
  precoCusto?: number | null;

  @IsNumber() @Min(0)
  precoVenda!: number;

  @IsBoolean() @IsOptional()
  ativo?: boolean;

  @IsBoolean() @IsOptional()
  exibirNoCardapio?: boolean;

  @IsString() @IsOptional()
  imageId?: string | null;

  // permitir null vindo do cliente
  @ValidateIf((o) => o.imagemUrl !== null && o.imagemUrl !== undefined)
  @IsString()
  imagemUrl?: string | null;

  @IsArray() @IsOptional()
  tamanhos?: { tamanho: 'P'|'M'|'G'; acrescimo: number }[];

  @IsArray() @IsOptional()
  adicionais?: { nome: string; preco: number; ativo?: boolean }[];
}
