import { RolesEnum } from "../usuarioModels/rolEnum";
import { TipoSolicitudModel } from "./tipoSolicitudModel";

export interface SolicitudNuevaModel {
  tipo: TipoSolicitudModel;

  // ALTA_ARQUITECTO
  matriculaArquitecto?: string;
  universidad?: string;
  anioRecibido?: number | null;

  // BAJA_ROL
  rolAEliminar?: RolesEnum;
  motivo?: string;
}