import { Routes } from '@angular/router';
import { PruebaToken } from './AAprueba-token/prueba-token';
import { Login } from './auth/pages/login/login';
import { Auth } from './auth/pages/autenticacion/auth';

export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'prueba-token', component: PruebaToken }

];