import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
