import { RolesEnum } from "./rolEnum";

export const RolModelDescripcion: Record<RolesEnum, string> = {
  [RolesEnum.ROLE_ADMINISTRADOR]: 'Administrador',
  [RolesEnum.ROLE_ARQUITECTO]: 'Arquitecto',
  [RolesEnum.ROLE_USUARIO]: 'Usuario'
};

export const RolPrioridad: Record<RolesEnum, number> = {
  [RolesEnum.ROLE_ADMINISTRADOR]: 3,
  [RolesEnum.ROLE_ARQUITECTO]: 2,
  [RolesEnum.ROLE_USUARIO]: 1
};

export interface RolesRequest {
  roles: RolesEnum[];
}
