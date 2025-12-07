import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoSolicitudModel } from '../../models/solicitudModels/estadoSolicitudModel';
import { SolicitudNuevaModel } from '../../models/solicitudModels/solicitudNuevaModel';
import { SolicitudResolucionModel } from '../../models/solicitudModels/solicitudResolucionModel';
import { SolicitudResponseModel } from '../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudModel } from '../../models/solicitudModels/tipoSolicitudModel';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../auth/services/tokenService/token-service';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  
  private readonly SOLICITUDES_URL = `${environment.apiUrl}/solicitudes`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService) {}

  /** ========== 1) Crear nueva solicitud (ALTA_ARQUITECTO / BAJA_ROL) ========== */
  nuevaSolicitud(dto: SolicitudNuevaModel, archivos?: File[]) {
    const formData = new FormData();

    // Parte JSON
    formData.append(
      'datosSolicitud',
      new Blob([JSON.stringify(dto)], { type: 'application/json' })
    );

    // Parte archivos (opcional)
    if (archivos && archivos.length) {
      archivos.forEach((archivo) =>
        formData.append('archivos', archivo, archivo.name)
      );
    }

    return this.http.post<SolicitudResponseModel>(
      `${this.SOLICITUDES_URL}/nueva`,
      formData
    );
  }

  /** ========== 2) Tomar solicitud (ADMIN) ========== */
  tomarSolicitud(id: number) {
    return this.http.patch<SolicitudResponseModel>(
      `${this.SOLICITUDES_URL}/${id}/tomar`,
      {}
    );
  }

  dejarSolicitudConFetch(id: number): void {
    if (!id) return;

    const url = `${this.SOLICITUDES_URL}/${id}/dejar`;
    const token = this.tokenService.obtenerToken();

    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      keepalive: true,
      credentials: 'include',
    }).catch(err => {
      console.error('Error al dejar solicitud con fetch keepalive:', err);
    });
  }


  /** ========== 3) Resolver solicitud (ADMIN) ========== */
  resolverSolicitud(id: number, body: SolicitudResolucionModel) {
    return this.http.patch<SolicitudResponseModel>(
      `${this.SOLICITUDES_URL}/${id}/resolver`,
      body
    );
  }

  /** ========== 4) Obtener una solicitud por ID ========== */
  getSolicitud(id: number) {
    return this.http.get<SolicitudResponseModel>(
      `${this.SOLICITUDES_URL}/${id}`
    );
  }

  /** ========== 5) Filtrar solicitudes (como getFiltrarObras) ========== */
  filtrarSolicitudes(
    tipo?: TipoSolicitudModel,
    estado?: EstadoSolicitudModel,
    usuarioId?: number,
    adminAsignadoId?: number,
    fechaDesde?: string,   // 'yyyy-MM-dd'
    fechaHasta?: string,   // 'yyyy-MM-dd'
    asignada?: boolean
  ) {
    let url = `${this.SOLICITUDES_URL}/filtrar`;

    const params: string[] = [];

    if (tipo) params.push(`tipo=${encodeURIComponent(tipo)}`);
    if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
    if (usuarioId != null) params.push(`usuarioId=${usuarioId}`);
    if (adminAsignadoId != null) params.push(`adminAsignadoId=${adminAsignadoId}`);
    if (fechaDesde) params.push(`fechaDesde=${encodeURIComponent(fechaDesde)}`);
    if (fechaHasta) params.push(`fechaHasta=${encodeURIComponent(fechaHasta)}`);
    if (asignada != null) params.push(`asignada=${asignada}`);

    if (params.length) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<SolicitudResponseModel[]>(url);
  }
  
}
