import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

export class IdParamDto {
  @IsString() @IsUUID()
  id!: string;
}
