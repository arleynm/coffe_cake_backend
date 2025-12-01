import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateDepositoDto {
  @ApiProperty({ example: 'Central', maxLength: 80 })
  @IsString() @Length(1, 80) nome!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateDepositoDto {
  @ApiPropertyOptional({ example: 'Loja Nova', maxLength: 80 })
  @IsOptional() @IsString() @Length(1, 80) nome?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateDepositoStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean() ativo!: boolean;
}
