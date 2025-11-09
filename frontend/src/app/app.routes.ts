import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Auth } from './auth/pages/autenticacion/auth';
import { Component } from '@angular/core';
import { Estudios } from './pages/estudios/estudios/estudios';
import { EstudioDetalle } from './pages/estudios/estudio-detalle/estudio-detalle';
import { CambiarPass } from './auth/pages/cambiar-pass/cambiar-pass';
import { EstudioForm } from './pages/estudios/estudio-form/estudio-form';
import { Obras } from './pages/obras/obras/obras';


export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'login', component: Auth},
  { path: 'registro', component: Auth},
  
  { path: 'estudios', component: Estudios},
  { path: 'formulario', component: EstudioForm},
  { path: 'estudios/:id', component: EstudioDetalle},
  { path: 'estudios/:id/editar', component: EstudioForm},
  { path: 'auth/password/:token', component: CambiarPass},
  { path: 'cambiar-pass', component: CambiarPass},
  { path: 'obras', component: Obras}


];  