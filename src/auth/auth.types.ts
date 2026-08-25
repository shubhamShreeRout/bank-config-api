export enum Role {
  ADMIN = 'ADMIN',
  CONFIG_MANAGER = 'CONFIG_MANAGER',
  READ_ONLY = 'READ_ONLY',
}
export interface JwtUser {
  sub: string;
  roles: Role[];
}
