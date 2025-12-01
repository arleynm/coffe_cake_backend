import * as argon2 from 'argon2';
export interface PasswordHasher {
  hash(p: string): Promise<string>;
  compare(p: string, hash: string): Promise<boolean>;
}
export class Argon2PasswordHasher implements PasswordHasher {
  hash(p: string) { return argon2.hash(p); }
  compare(p: string, hash: string) { return argon2.verify(hash, p); }
}
