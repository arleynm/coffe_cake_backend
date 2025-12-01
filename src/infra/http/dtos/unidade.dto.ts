import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnidadeDto {
  @ApiProperty({ example: 'g', description: 'Código curto da unidade (ex: kg, g, L, ml, un)' })
  @IsString() @Length(1, 10) codigo!: string;

  @ApiProperty({ example: 'Grama' })
  @IsString() nome!: string;

  @ApiProperty({ example: 1, description: 'Fator para converter para a unidade base' })
  @Type(() => Number)
  @IsNumber() fatorBase!: number;
}

export class UpdateUnidadeDto {
  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional() @IsString() @Length(1, 10) codigo?: string;

  @ApiPropertyOptional({ example: 'Quilograma' })
  @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional() @Type(() => Number) @IsNumber() fatorBase?: number;
}
