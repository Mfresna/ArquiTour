import { Routes } from '@angular/router';
import { PruebaToken } from './AAprueba-token/prueba-token';
import { Login } from './auth/pages/login/login';
import { Auth } from './auth/pages/autenticacion/auth';
import { Component } from '@angular/core';
import { Estudios } from './pages/estudios/estudios/estudios';
import { RecuperarPass } from './auth/pages/recuperar-pass/recuperar-pass';

export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'prueba-token', component: PruebaToken},
  { path: 'estudios', component: Estudios},
  { path: 'auth/password/:token', component: RecuperarPass}

];  