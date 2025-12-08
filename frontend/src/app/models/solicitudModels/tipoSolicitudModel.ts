export enum TipoSolicitudModel {
  ALTA_ARQUITECTO = 'ALTA_ARQUITECTO',
  BAJA_ROL = 'BAJA_ROL',
}

/** Descripciones legibles para mostrar en la UI */
export const TipoSolicitudDescripcion: Record<TipoSolicitudModel, string> = {
  [TipoSolicitudModel.ALTA_ARQUITECTO]: 'Alta Rol',
  [TipoSolicitudModel.BAJA_ROL]: 'Baja rol',
};