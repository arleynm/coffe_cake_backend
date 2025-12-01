import { User } from '../entities/user';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: { nome: string; email: string; senhaHash: string }): Promise<User>;
}
