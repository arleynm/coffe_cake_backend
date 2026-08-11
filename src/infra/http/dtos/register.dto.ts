import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Arley', description: 'Nome completo' })
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'arley@ex.com', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 6, description: 'Senha de acesso' })
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'STAFF'], default: 'STAFF', description: 'Perfil de acesso (apenas ADMIN pode definir)' })
  @IsOptional()
  @IsIn(['ADMIN', 'STAFF'])
  role?: 'ADMIN' | 'STAFF';
}
