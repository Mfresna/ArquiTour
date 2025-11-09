import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EstudioModel } from '../../models/estudioModel';
import { tap } from 'rxjs/operators';

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

  updateImagenPerfil(idEstudio: number, url: string) {
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

  //Para el filtro de estudios en obras

  //1) Precarga TODA la lista de estudios (para select y resolver nombre por id) 
  precargarTodos() {
    return this.getFiltrarEstudios().pipe(
      tap(lista => {
        this.estudios = lista ?? [];
        this.reconstruirMapaNombres(this.estudios);
      })
    );
  }

  getNombreById(id?: number): string | undefined {
    if (!id) return undefined;
    return this.nombrePorId.get(id);
  }

  // Búsqueda en memoria para el buscador dentro del select 
  buscarEnCachePorNombre(q: string): EstudioModel[] {
    const s = (q ?? '').trim().toLowerCase();
    if (!s) return this.estudios;
    return this.estudios.filter(e => (e.nombre ?? '').toLowerCase().includes(s));
  }

  private reconstruirMapaNombres(lista: EstudioModel[]) {
    this.nombrePorId.clear();
    for (const e of (lista ?? [])) {
      if (e?.id != null) this.nombrePorId.set(e.id, e.nombre);
    }
  }
}


