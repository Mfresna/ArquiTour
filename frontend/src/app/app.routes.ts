import { Routes } from '@angular/router';
import { PruebaToken } from './prueba-token/prueba-token';
import { Login } from './pages/login/login';

export const routes: Routes = [
  
  { path: '', component: Login },
  { path: 'prueba-token', component: PruebaToken }
];