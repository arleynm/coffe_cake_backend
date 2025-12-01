import { Deposito } from '../entities/deposito.entity';

export abstract class DepositoRepository {
  abstract create(data: { nome: string; ativo?: boolean }): Promise<Deposito>;
  abstract findAll(): Promise<Deposito[]>;
  abstract findById(id: string): Promise<Deposito | null>;
  abstract findByNome(nome: string): Promise<Deposito | null>;
  abstract update(id: string, data: { nome?: string; ativo?: boolean }): Promise<Deposito>;
}
