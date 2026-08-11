import { Body, Controller, INestApplication, Post, ValidationPipe } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { Test } from '@nestjs/testing';
import request from 'supertest';

// DTO/controller mínimos para exercitar o ValidationPipe global (mesma config do main.ts)
// sem depender de banco de dados.
class CriarItemDto {
  @IsString()
  nome!: string;

  @IsInt()
  @Min(1)
  quantidade!: number;
}

@Controller('itens')
class ItensTestController {
  @Post()
  criar(@Body() dto: CriarItemDto) {
    return { ok: true, dto };
  }
}

describe('ValidationPipe global (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ItensTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('aceita payload válido', () => {
    return request(app.getHttpServer())
      .post('/itens')
      .send({ nome: 'Café', quantidade: 2 })
      .expect(201);
  });

  it('rejeita campo desconhecido (forbidNonWhitelisted)', () => {
    return request(app.getHttpServer())
      .post('/itens')
      .send({ nome: 'Café', quantidade: 2, admin: true })
      .expect(400);
  });

  it('rejeita tipo/valor inválido', () => {
    return request(app.getHttpServer())
      .post('/itens')
      .send({ nome: 'Café', quantidade: 0 })
      .expect(400);
  });
});
