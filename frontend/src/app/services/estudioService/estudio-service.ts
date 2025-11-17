import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { EstudioModel } from "../../models/estudioModels/estudioModel";

@Injectable({
  providedIn: 'root',
})
export class EstudioService {

  private readonly ESTUDIOS_URL = `${environment.apiUrl}/estudios`

  estudios: EstudioModel[];
  private nombrePorId = new Map<number, string>(); // id -> nombre

    
  constructor(private http: HttpClient) {
      this.estudios = [];
  }

  getEstudio(id: number) {
    return this.http.get<EstudioModel>(`${this.ESTUDIOS_URL}/${id}`);
  }

  getFiltrarEstudios(nombre?: string, obraId?: number) {
    let url = `${this.ESTUDIOS_URL}/filtrar`;
    //Se guardan los parámetros
    const parametros: string[] = [];
    if (nombre) parametros.push(`nombre=${encodeURIComponent(nombre)}`);
    if (obraId != null) parametros.push(`obraId=${obraId}`);
    //Arma URL con los filtros
    if (parametros.length) url += `?${parametros.join('&')}`;
    return this.http.get<EstudioModel[]>(url);
  }

  postEstudio(estudio: EstudioModel) {
    return this.http.post<EstudioModel>(this.ESTUDIOS_URL, estudio);
  }

  updateEstudio(estudio: EstudioModel) {
    return this.http.put<EstudioModel>(`${this.ESTUDIOS_URL}/${estudio.id}`, estudio);
  }

  deleteEstudio(id: number) {
    return this.http.delete<void>(`${this.ESTUDIOS_URL}/${id}`);
  }

  updateImagenPerfil(idEstudio: number, url: string | null) {
    return this.http.patch<EstudioModel>(
      `${this.ESTUDIOS_URL}/${idEstudio}/imagenPerfil`,
      { url },{
        withCredentials: true,
      }
    );
  }

  //Arquitectos

  agregarArquitecto(estudioId: number, arquitectoId: number) {
    return this.http.put<EstudioModel>(
      `${this.ESTUDIOS_URL}/${estudioId}/arquitectos/${arquitectoId}`,
      {}
    );
  }

  eliminarArquitecto(estudioId: number, arquitectoId: number) {
    return this.http.delete<EstudioModel>(
      `${this.ESTUDIOS_URL}/${estudioId}/arquitectos/${arquitectoId}`
    );
  }

  //nombre estudios

  getNombreById(id?: number): string | undefined {
    if (!id) return undefined;
  return this.nombrePorId.get(id);
  }

  //se almacena para ganar velocidad y no tener que consultarlo siempre
  cachearNombre(id: number, nombre: string): void {
    if (id && nombre) this.nombrePorId.set(id, nombre);
  }

}


