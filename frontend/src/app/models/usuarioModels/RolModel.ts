export enum RolModel {
  ROLE_ADMINISTRADOR = 'ROLE_ADMINISTRADOR',
  ROLE_ARQUITECTO = 'ROLE_ARQUITECTO',
  ROLE_USUARIO = 'ROLE_USUARIO'
}

export const RolModelDescripcion: Record<RolModel, string> = {
  [RolModel.ROLE_ADMINISTRADOR]: 'Administrador',
  [RolModel.ROLE_ARQUITECTO]: 'Arquitecto',
  [RolModel.ROLE_USUARIO]: 'Usuario'
};

export const RolPrioridad: Record<RolModel, number> = {
  [RolModel.ROLE_ADMINISTRADOR]: 3,
  [RolModel.ROLE_ARQUITECTO]: 2,
  [RolModel.ROLE_USUARIO]: 1
};