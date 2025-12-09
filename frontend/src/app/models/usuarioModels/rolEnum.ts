export enum RolesEnum {
  ROLE_ADMINISTRADOR = 'ROLE_ADMINISTRADOR',
  ROLE_ARQUITECTO = 'ROLE_ARQUITECTO',
  ROLE_USUARIO = 'ROLE_USUARIO'
}

export const RolDescripcion: Record<RolesEnum, string> = {
  [RolesEnum.ROLE_ADMINISTRADOR]: "Administrador",
  [RolesEnum.ROLE_ARQUITECTO]: "Arquitecto",
  [RolesEnum.ROLE_USUARIO]: ""
};
