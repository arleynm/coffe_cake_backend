import { Unidade } from '../entities/unidade.entity';

export abstract class UnidadeRepository {
  abstract create(data: { codigo: string; nome: string; fatorBase: number }): Promise<Unidade>;
  abstract findAll(): Promise<Unidade[]>;
  abstract findByCodigo(codigo: string): Promise<Unidade | null>;
  abstract findById(id: string): Promise<Unidade | null>;
  abstract update(id: string, data: Partial<Pick<Unidade, 'codigo' | 'nome' | 'fatorBase'>>): Promise<Unidade>;
  abstract delete(id: string): Promise<void>;
}
