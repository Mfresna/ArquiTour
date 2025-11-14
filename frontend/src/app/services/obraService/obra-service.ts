import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { CategoriaObraModel } from "../../models/obraModels/categoriaObraModel";
import { EstadoObraModel } from "../../models/obraModels/estadoObraModel";
import { ObraModel } from "../../models/obraModels/obraModel";


@Injectable({
  providedIn: 'root',
})
export class ObraService {
  
  private readonly OBRAS_URL = `${environment.apiUrl}/obras`

  obras: ObraModel[];
  private nombrePorId = new Map<number, string>(); // id -> nombre

  constructor(private http: HttpClient) {
      this.obras = [];
  }

  getObra(id: number) {
    return this.http.get<ObraModel>(`${this.OBRAS_URL}/${id}`);
  }

  postObra(obra: ObraModel) {
    return this.http.post<ObraModel>(this.OBRAS_URL, obra);
  }

  updateObra(obra: ObraModel) {
    return this.http.put<ObraModel>(`${this.OBRAS_URL}/${obra.id}`, obra);
  }

  deleteObra(id: number) {
    return this.http.delete<void>(`${this.OBRAS_URL}/${id}`);
  }

  getFiltrarObras(
    categoria?: CategoriaObraModel,
    estado?: EstadoObraModel,
    estudioId?: number,
    nombre?: string
    ) {
    let url = `${this.OBRAS_URL}/filtrar`;

    // Parámetros
    const params: string[] = [];
    if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
    if (estado)    params.push(`estado=${encodeURIComponent(estado)}`);
    if (estudioId != null) params.push(`estudioId=${estudioId}`);
    if (nombre) params.push(`nombre=${encodeURIComponent(nombre)}`);

    // Arma URL con los filtros
    if (params.length) url += `?${params.join('&')}`;

    return this.http.get<ObraModel[]>(url);
  }

  cachearNombre(id: number, nombre: string) {
    if (id != null && !!nombre) this.nombrePorId.set(id, nombre);
  }
  getNombreById(id: number): string | undefined {
    return this.nombrePorId.get(id);
  }
  
}
