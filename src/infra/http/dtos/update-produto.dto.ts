import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}

export class IdParamDto {
  @ApiProperty({
    type: String,
    description: 'ID do produto (string: CUID/UUID/etc.)',
    example: 'cmh1epf4d0009fa785k2ur152', // exemplo de CUID
    // NÃO usar format: 'uuid'
  })
  @IsString()
  id!: string;
}