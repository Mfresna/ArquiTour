import { Routes } from '@angular/router';
import { Home } from './pages/home-component/home-component';
import { Detalle } from './pages/detalle/detalle';
import { PruebaToken } from './prueba-token/prueba-token';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'estudios/:id', component: Detalle }
  { path: 'prueba-token', component: PruebaToken }
];