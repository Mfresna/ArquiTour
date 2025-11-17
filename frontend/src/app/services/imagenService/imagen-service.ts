import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagenService {

  private readonly IMG_URL = `${environment.apiUrl}/imagenes`;

  constructor(private http: HttpClient) {}

  ////CAPAS SE BORRA

  subirUna(file: File | null) {
    
    if (!file) return throwError(() => 'Sin imagen');

    const fd = new FormData();
    fd.append('archivos', file); 
    return this.http.post<string[]>(`${environment.apiUrl}/imagenes/subir`, fd);
  }

  // Sube VARIAS imágenes
  subirVarias(files: File[]): Observable<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('archivos', f));
    return this.http.post<string[]>(`${this.IMG_URL}/subir`, form);
  }

  ////CAPAS SE BORRA


  subirImagen(files: File[]): Observable<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('archivos', f));

    return this.http.post<string[]>(`${this.IMG_URL}/subir`, form);
  }

  obtenerPorId(id: number) {
    return this.http.get<{ url: string }>(`${this.IMG_URL}/${id}`);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.IMG_URL}/${id}`);
  }
}
