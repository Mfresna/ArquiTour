import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { EstudioModel } from '../../../models/estudioModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EstudioService {
    readonly ESTUDIOS_URL = `${environment.apiUrl}/estudios`

    estudios: EstudioModel[];

    
   constructor(private http: HttpClient) {
      this.estudios = [];
    }


}
