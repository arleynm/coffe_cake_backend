import { IsBoolean, IsInt, IsOptional, IsString, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export type PedidoStatusBE = 'RECEBIDO' | 'PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';

export class ListPedidoQueryDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['RECEBIDO', 'PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'])
  status?: PedidoStatusBE;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  })
  @IsBoolean()
  todos?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsInt()
  @Min(1)
  take?: number;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : String(value)))
  @IsString()
  mesa?: string;
}