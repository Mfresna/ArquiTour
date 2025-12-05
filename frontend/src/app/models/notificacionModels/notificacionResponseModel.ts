import { TipoNotificacionEnum } from "./tipoNotificacionEnum";

export interface NotificacionResponseModel {
  id: number;
  emisorId: number;
  receptorId: number;
  mensaje: string;
  fecha: string;
  leido: boolean;
  tipo: TipoNotificacionEnum;
  referenciaId?: number | null;
}