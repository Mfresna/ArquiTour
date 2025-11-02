// src/app/services/estudios.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudio } from '../models/estudio.model'; // Importa el modelo

@Injectable({
  // providedIn: 'root' hace que el servicio sea un singleton en toda la aplicación (a partir de Angular 6+)
  providedIn: 'root'
})
export class EstudiosService {
  // URL base de tu API
  private apiUrl = 'http://localhost:8080/estudios/filtrar';

  // Inyección del HttpClient (usando `inject()` o en el constructor)
  private http = inject(HttpClient);

  constructor() { }

  /**
   * Obtiene la lista de estudios desde el endpoint.
   * La respuesta es un array de objetos Estudio.
   * @returns Un Observable que emite un array de Estudio.
   */
  getEstudios(): Observable<Estudio[]> {
    // Usamos HttpClient.get<Estudio[]>() para tipar la respuesta.
    return this.http.get<Estudio[]>(this.apiUrl);
  }
}