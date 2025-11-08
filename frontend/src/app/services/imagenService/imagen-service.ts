import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagenService {

private readonly URL = `${environment.apiUrl}/imagenes`;

  constructor(private http: HttpClient) {}


  subirUna(file: File) {
  const fd = new FormData();
  fd.append('archivos', file); 
  return this.http.post<string[]>(`${environment.apiUrl}/imagenes/subir`, fd);
}

  // Sube VARIAS imágenes
  subirVarias(files: File[]): Observable<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('archivos', f));
    return this.http.post<string[]>(`${this.URL}/subir`, form);
  }


  obtenerPorId(id: number) {
    return this.http.get<{ url: string }>(`${this.URL}/${id}`);
  }


  eliminar(id: number) {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
  
}
