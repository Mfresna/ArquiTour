// src/app/services/estudios.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Estudio } from '../models/estudio.model';

@Injectable({
  // providedIn: 'root' hace que el servicio sea un singleton en toda la aplicación (a partir de Angular 6+)
  providedIn: 'root'
})
export class EstudiosService {

  readonly API_URL = "http://localhost:8080/estudios/filtrar"
    readonly API_URLBASE = "http://localhost:8080/estudios"

  productos : Estudio[]

  constructor(private http: HttpClient){
    this.productos = []
  }

  getProductos(){
    return this.http.get<Estudio[]>(this.API_URL);
  }

  getProducto(id : string){
    return this.http.get<Estudio>(`${this.API_URLBASE}/${id}`);
  }

  postProducto(p : Estudio){
    return this.http.post<Estudio>(this.API_URL, p);
  }

  deleteProducto(id : string){
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateProducto(p: Estudio) {
    return this.http.put<Estudio>(`${this.API_URL}/${p.id}`, p);
  }
}


