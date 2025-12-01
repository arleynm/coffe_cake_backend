import { IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'arley@ex.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 6 })
  @IsNotEmpty()
  senha: string;

  @ApiProperty({ example: true, required: false, description: 'Lembrar sessão (30d)' })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}
