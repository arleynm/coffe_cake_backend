import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class EntradaDto {
  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 'cmd456...' })
  @IsString() depositoId!: string;

  @ApiProperty({ example: 1000 })
  @Type(() => Number) @IsNumber() quantidadeBase!: number;

  @ApiPropertyOptional({ example: 'cml789...' })
  @IsOptional() @IsString() loteId?: string | null;

  @ApiPropertyOptional({ example: '0.05', description: 'Decimal em string' })
  @IsOptional() @IsString() custoUnitario?: string | null;

  @ApiPropertyOptional({ example: 'NF-123' })
  @IsOptional() @IsString() documentoRef?: string | null;

  @ApiPropertyOptional({ example: 'Compra inicial' })
  @IsOptional() @IsString() observacao?: string | null;
}

export class SaidaDto {
  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 'cmd456...' })
  @IsString() depositoId!: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number) @IsNumber() quantidadeBase!: number;

  @ApiPropertyOptional({ example: 'cml789...' })
  @IsOptional() @IsString() loteId?: string | null;

  @ApiPropertyOptional({ example: 'ORDEM-01' })
  @IsOptional() @IsString() documentoRef?: string | null;

  @ApiPropertyOptional({ example: 'Consumo produção' })
  @IsOptional() @IsString() observacao?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Aceita true/false ou "true"/"false" na query/body',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  allowNegative?: boolean;
}

export class AjusteDto {
  @ApiProperty({ enum: ['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'] })
  @IsString() tipo!: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';

  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 'cmd456...' })
  @IsString() depositoId!: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number) @IsNumber() quantidadeBase!: number;

  @ApiPropertyOptional({ example: 'cml789...' })
  @IsOptional() @IsString() loteId?: string | null;

  @ApiPropertyOptional({ example: 'INV-2025' })
  @IsOptional() @IsString() documentoRef?: string | null;

  @ApiPropertyOptional({ example: 'Inventário' })
  @IsOptional() @IsString() observacao?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Para ajuste negativo, aceita "true"/"false" também',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  allowNegative?: boolean;
}

export class TransferenciaDto {
  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 800 })
  @Type(() => Number) @IsNumber() quantidadeBase!: number;

  @ApiProperty({ example: 'cmd-ORIGEM' })
  @IsString() depositoOrigemId!: string;

  @ApiProperty({ example: 'cmd-DESTINO' })
  @IsString() depositoDestinoId!: string;

  @ApiPropertyOptional({ example: 'cml789...' })
  @IsOptional() @IsString() loteId?: string | null;

  @ApiPropertyOptional({ example: 'TRANSF-01' })
  @IsOptional() @IsString() documentoRef?: string | null;

  @ApiPropertyOptional({ example: 'Reposição loja' })
  @IsOptional() @IsString() observacao?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  allowNegative?: boolean;
}

export class SaldoQueryDto {
  @ApiProperty() @IsString() insumoId!: string;
  @ApiProperty() @IsString() depositoId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() loteId?: string;
}
