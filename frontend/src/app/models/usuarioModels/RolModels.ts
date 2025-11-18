import { Roles } from "./RolModelEnum";

export const RolModelDescripcion: Record<Roles, string> = {
  [Roles.ROLE_ADMINISTRADOR]: 'Administrador',
  [Roles.ROLE_ARQUITECTO]: 'Arquitecto',
  [Roles.ROLE_USUARIO]: 'Usuario'
};

export const RolPrioridad: Record<Roles, number> = {
  [Roles.ROLE_ADMINISTRADOR]: 3,
  [Roles.ROLE_ARQUITECTO]: 2,
  [Roles.ROLE_USUARIO]: 1
};

export interface RolesRequest {
  roles: Roles[];
}
