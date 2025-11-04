import { Routes } from '@angular/router';
import { PruebaToken } from './prueba-token/prueba-token';
import { Login } from './pages/login/login';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'prueba-token', component: PruebaToken }
];