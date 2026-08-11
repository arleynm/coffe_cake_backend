export type Role = 'ADMIN' | 'STAFF';

export interface UserProps {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: Role;
  isActive: boolean;
}

export class User {
  constructor(public props: UserProps) {}
  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get nome() { return this.props.nome; }
  get role() { return this.props.role; }
  get isActive() { return this.props.isActive; }
}
