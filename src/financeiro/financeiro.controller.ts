import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../infra/auth/jwt.guard';
import { RolesGuard } from '../infra/auth/roles.guard';
import { Roles } from '../infra/auth/roles.decorator';
import { FinanceiroService } from './financeiro.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get('resumo')
  resumo(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.resumo(from, to);
  }
}
