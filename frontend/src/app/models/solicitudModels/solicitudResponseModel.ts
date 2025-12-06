import { RolesEnum } from "../usuarioModels/rolEnum";
import { UsuarioBasicoModel } from "../usuarioModels/usuarioBasicoModel";
import { EstadoSolicitudModel } from "./estadoSolicitudModel";
import { TipoSolicitudModel } from "./tipoSolicitudModel";

export interface SolicitudResponseModel {
  id: number;

  tipoSolicitud: TipoSolicitudModel;

  idUsuario?: number | null;
  idAdminAsignado?: number | null;

  usuario: UsuarioBasicoModel;

  estado: EstadoSolicitudModel;

  adminAsignado?: UsuarioBasicoModel | null;

  fechaCreacion: string;
  fechaResolucion?: string | null;

  comentarioRta?: string | null;

  // Alta arquitecto
  matriculaArquitecto?: string | null;
  universidad?: string | null;
  anioRecibido?: number | null;
  urlsImagenes?: string[];

  // Baja rol
  rolBaja?: RolesEnum | null;  
  motivo?: string | null;
}