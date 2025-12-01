import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInsumoDto {
  @ApiProperty({ example: 'Café em pó' })
  @IsString() nome!: string;

  @ApiProperty({ example: 'cmg584n8q0000faiglwutld7e', description: 'ID da unidade base (cuid)' })
  @IsString() unidadeBaseId!: string;

  @ApiPropertyOptional({ example: 'CAF-001' })
  @IsOptional() @IsString() sku?: string | null;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional() @Type(() => Number) @IsNumber() estoqueMinimo?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateInsumoDto {
  @ApiPropertyOptional({ example: 'Café moído' })
  @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional({ example: 'cmg584n8q0000faiglwutld7e' })
  @IsOptional() @IsString() unidadeBaseId?: string;

  @ApiPropertyOptional({ example: 'CAF-002' })
  @IsOptional() @IsString() sku?: string | null;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional() @Type(() => Number) @IsNumber() estoqueMinimo?: number | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class ToggleInsumoDto {
  @ApiProperty({ example: true })
  @IsBoolean() ativo!: boolean;
}

export class ListInsumosQueryDto {
  @ApiPropertyOptional({ example: 'cafe' })
  @IsOptional() @IsString() search?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Aceita true/false ou "true"/"false" na query string',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  onlyActive?: boolean;
}


