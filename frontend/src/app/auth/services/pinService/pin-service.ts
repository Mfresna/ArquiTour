import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PinRequestModel } from '../../models/pin/pinRequestModel';
import { PinResponseModel } from '../../models/pin/pinResponseModel';

@Injectable({
  providedIn: 'root',
})
export class PinService {

  private readonly PIN_URL = `${environment.apiUrl}/validacion`;

  constructor(
    private http: HttpClient
  ){}


  enviarPin(email: string){
    return this.http.post(`${this.PIN_URL}/enviarPin`, {email})
  }

  validarPin(email: string, pin: string){

    let validadorPin: PinRequestModel = {
      email: email,
      pin: pin
    };

    return this.http.post(`${this.PIN_URL}/verificarPin`, validadorPin)
  }

  
}
