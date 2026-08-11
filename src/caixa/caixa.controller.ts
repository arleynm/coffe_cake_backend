import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../infra/auth/jwt.guard';
import { CaixaService } from './caixa.service';

@UseGuards(JwtAuthGuard)
@Controller('caixa')
export class CaixaController {
  constructor(private readonly service: CaixaService) {}

  @Get('atual')
  atual() {
    return this.service.atual();
  }

  @Get('historico')
  historico() {
    return this.service.historico();
  }

  @Post('abrir')
  abrir(@Body() body: { openingAmount?: number; openedBy?: string }) {
    return this.service.abrir(body);
  }

  @Post('movimento')
  movimento(@Body() body: { type: string; method?: string | null; amount: number; orderNumber?: number | null; description?: string | null }) {
    return this.service.addMovimento(body);
  }

  @Post('fechar')
  fechar(@Body() body: { declaredCash?: number; closedBy?: string }) {
    return this.service.fechar(body);
  }
}
