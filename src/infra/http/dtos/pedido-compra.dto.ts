import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePedidoItemDto {
  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 5000 })
  @Type(() => Number) @IsNumber() quantidadeBase!: number;

  @ApiProperty({ example: '0.06', description: 'Decimal em string' })
  @IsString() custoUnitario!: string;

  @ApiProperty({ example: 'cmd456...' })
  @IsString() depositoId!: string;

  @ApiPropertyOptional({ example: 'L-002' })
  @IsOptional() @IsString() loteCodigo?: string | null;

  @ApiPropertyOptional({ example: '2026-06-01', format: 'date' })
  @IsOptional() @IsISO8601() validade?: string | null;
}

export class CreatePedidoDto {
  @ApiPropertyOptional({ example: 'PC-0001' })
  @IsOptional() @IsString() numero?: string;

  @ApiPropertyOptional({ example: 'Fornecedor X' })
  @IsOptional() @IsString() fornecedor?: string | null;

  @ApiProperty({ type: () => [CreatePedidoItemDto] })
  @IsArray() itens!: CreatePedidoItemDto[];
}

export class ListPedidosQueryDto {
  @ApiPropertyOptional({ enum: ['ABERTO', 'RECEBIDO', 'CANCELADO'] })
  @IsOptional() @IsString() status?: 'ABERTO' | 'RECEBIDO' | 'CANCELADO';
}

export class ReceberPedidoItemDto extends CreatePedidoItemDto {}

export class ReceberPedidoDto {
  @ApiPropertyOptional({ example: 'NF-456' })
  @IsOptional() @IsString() documentoRef?: string | null;

  @ApiPropertyOptional({ example: 'Recebimento total' })
  @IsOptional() @IsString() observacao?: string | null;

  @ApiPropertyOptional({ type: () => [ReceberPedidoItemDto] })
  @IsOptional() @IsArray() itens?: ReceberPedidoItemDto[];
}
