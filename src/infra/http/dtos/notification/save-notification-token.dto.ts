import { IsOptional, IsString } from 'class-validator';

export class SaveNotificationTokenDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  platform?: string;
}