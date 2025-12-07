export enum TipoNotificacionEnum {
  SOLICITUD_CAMBIO_ROL = 'SOLICITUD_CAMBIO_ROL',
  RESPUESTA_CAMBIO_ROL = 'RESPUESTA_CAMBIO_ROL',
  CAMBIO_ROL = 'CAMBIO_ROL',
  MENSAJE_GENERAL = 'MENSAJE_GENERAL'
}

export const TipoNotificacionDescripcion: Record<TipoNotificacionEnum, string> = {
  [TipoNotificacionEnum.SOLICITUD_CAMBIO_ROL]: 'Nueva Solicitud de Rol',
  [TipoNotificacionEnum.RESPUESTA_CAMBIO_ROL]: 'Respuesta Solicitud de Rol',
  [TipoNotificacionEnum.CAMBIO_ROL]: 'Cambio de Rol',
  [TipoNotificacionEnum.MENSAJE_GENERAL]: 'Mensaje general'
};