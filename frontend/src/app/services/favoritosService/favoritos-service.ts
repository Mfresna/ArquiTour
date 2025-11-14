import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ObraModel } from '../../models/obraModels/obraModel';
import { FavoritoBasicoModel } from '../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosModel } from '../../models/favoritosModels/favoritosModel';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {

  private readonly FAVORITOS_URL = `${environment.apiUrl}/favoritos`;

  constructor(private http: HttpClient) {}

  crearOActualizarFavorito(nombreLista: string, idObras: number[]) {
    const body = { nombreLista, idObras };
    return this.http.post<FavoritosModel>(this.FAVORITOS_URL, body);
  }

  obtenerFavoritosDelUsuario() {
    return this.http.get<FavoritoBasicoModel[]>(this.FAVORITOS_URL);
  }

  listarObrasDeFavorito(idFavorito: number) {
    const url = `${this.FAVORITOS_URL}/${idFavorito}/obras`;
    return this.http.get<ObraModel[]>(url);
  }

  agregarObraAFavorito(idFavorito: number, obraId: number) {
    const url = `${this.FAVORITOS_URL}/${idFavorito}/obras/${obraId}`;
    return this.http.patch<FavoritosModel>(url, {});
  }

  eliminarObraDeFavorito(idFavorito: number, obraId: number) {
    const url = `${this.FAVORITOS_URL}/${idFavorito}/obras/${obraId}`;
    return this.http.delete<FavoritosModel>(url);
  }

  renombrarFavorito(idFavorito: number, nuevoNombre: string) {
    const url = `${this.FAVORITOS_URL}/${idFavorito}/renombrar`;
    const body = { nuevoNombre };
    return this.http.patch<FavoritosModel>(url, body);
  }

  eliminarFavorito(idFavorito: number) {
    const url = `${this.FAVORITOS_URL}/${idFavorito}`;
    return this.http.delete<void>(url);
  }
}