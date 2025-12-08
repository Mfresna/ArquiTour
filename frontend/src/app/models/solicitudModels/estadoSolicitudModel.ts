export enum EstadoSolicitudModel {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

/** Descripciones legibles para mostrar en la UI */
export const EstadoSolicitudDescripcion: Record<EstadoSolicitudModel, string> = {
  [EstadoSolicitudModel.PENDIENTE]: 'Pendiente',
  [EstadoSolicitudModel.EN_PROCESO]: 'En Proceso',
  [EstadoSolicitudModel.APROBADA]: 'Aprobada',
  [EstadoSolicitudModel.RECHAZADA]: 'Rechazada',
};