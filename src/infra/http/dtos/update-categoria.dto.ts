import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}