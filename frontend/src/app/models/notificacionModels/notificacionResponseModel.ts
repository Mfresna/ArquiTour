import { TipoNotificacionEnum } from "./tipoNotificacionEnum";

export interface NotificacionResponseModel {
  id: number;
  emisorId: number;
  emisorEmail: string;
  receptorId: number;
  receptorEmail: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  tipo: TipoNotificacionEnum;
  referenciaId?: number | null;
}