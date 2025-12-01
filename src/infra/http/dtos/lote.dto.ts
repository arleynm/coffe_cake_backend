import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateLoteDto {
  @ApiProperty({ example: 'cmi123...' })
  @IsString() insumoId!: string;

  @ApiProperty({ example: 'cmd456...' })
  @IsString() depositoId!: string;

  @ApiPropertyOptional({ example: 'L-001' })
  @IsOptional() @IsString() codigo?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31', format: 'date' })
  @IsOptional() @IsISO8601() validade?: string | null; // yyyy-mm-dd
}

export class UpdateLoteDto {
  @ApiPropertyOptional({ example: 'L-002' })
  @IsOptional() @IsString() codigo?: string | null;

  @ApiPropertyOptional({ example: '2027-01-31', format: 'date' })
  @IsOptional() @IsISO8601() validade?: string | null;
}

export class ListLotesQueryDto {
  @ApiPropertyOptional({ example: 'cmi123...' })
  @IsOptional() @IsString() insumoId?: string;

  @ApiPropertyOptional({ example: 'cmd456...' })
  @IsOptional() @IsString() depositoId?: string;

  @ApiPropertyOptional({
    example: '7',
    description: 'Dias até o vencimento (string na query, ex.: "7")',
  })
  @IsOptional() @IsString() vencendoEmDias?: string;
}
