// src/infra/http/controllers/dtos/pedido.dto.ts
import {
  IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min,
  ValidateNested, IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import type { PedidoStatus, FormaPagamento } from '../../../domain/pedido/pedido.entity';

// ✅ listas runtime para validação
export const PEDIDO_STATUS = ['RECEBIDO','PREPARO','PRONTO','ENTREGUE','CANCELADO'] as const;
export const FORMAS_PAGAMENTO = ['PIX','DINHEIRO','CARTAO_CREDITO','CARTAO_DEBITO'] as const;


export class AdicionalDTO {
  @IsString() nome!: string;
  @Type(() => Number) @IsNumber() preco!: number;
}

export class ItemDTO {
  @IsOptional() @IsString() produtoId?: string;
  @IsString() nome!: string;
  @IsOptional() @IsString() tamanho?: 'P'|'M'|'G';
  @Type(() => Number) @IsInt() @Min(1) quantidade!: number;
  @Type(() => Number) @IsNumber() precoUnit!: number;
  @IsOptional() @IsString() obs?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => AdicionalDTO)
  adicionais: AdicionalDTO[] = [];
}

export class CreatePedidoHttpDTO {
  @IsString() @IsNotEmpty() mesa!: string;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsIn(['LOCAL','RETIRADA','ENTREGA']) tipoAtendimento?: 'LOCAL'|'RETIRADA'|'ENTREGA';
  @IsOptional() @IsString() clienteNome?: string;
  @IsOptional() @IsString() clienteTelefone?: string;
  @IsOptional() @IsString() deliveryZoneId?: string;
  @IsOptional() @IsString() enderecoCep?: string;
  @IsOptional() @IsString() enderecoRua?: string;
  @IsOptional() @IsString() enderecoNumero?: string;
  @IsOptional() @IsString() enderecoBairro?: string;
  @IsOptional() @IsString() enderecoCidade?: string;
  @IsOptional() @IsString() enderecoUf?: string;
  @IsOptional() @IsString() enderecoComplemento?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) taxaEntrega?: number;
  @IsOptional() @Type(() => Number) @IsNumber() entregaLatitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() entregaLongitude?: number;
  @IsOptional() entregaPrevistaEm?: Date;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDTO)
  itens!: ItemDTO[];
}

export class UpdatePedidoHttpDTO {
  @IsOptional() @IsString() mesa?: string;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDTO)
  itens?: ItemDTO[];
}

// 👇 status agora é opcional; formaPagamento continua opcional
export class ChangeStatusHttpDTO {
  @IsOptional() @IsIn(PEDIDO_STATUS) status?: 'RECEBIDO'|'PREPARO'|'PRONTO'|'ENTREGUE'|'CANCELADO';
  @IsOptional() @IsIn(FORMAS_PAGAMENTO) formaPagamento?: 'PIX'|'DINHEIRO'|'CARTAO_CREDITO'|'CARTAO_DEBITO';
}
