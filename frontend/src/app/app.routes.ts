import { Routes } from '@angular/router';
import { PruebaToken } from './AAprueba-token/prueba-token';
import { Login } from './auth/pages/login/login';
import { Auth } from './auth/pages/autenticacion/auth';
import { Component } from '@angular/core';
import { Estudios } from './pages/estudios/estudios/estudios';
import { EstudioDetalle } from './pages/estudios/estudio-detalle/estudio-detalle';
import { RecuperarPass } from './auth/pages/recuperar-pass/recuperar-pass';
import { EstudiosFormularios } from './pages/estudios/estudios-formularios/estudios-formularios';

export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'login', component: Auth},
  { path: 'prueba-token', component: PruebaToken},
  { path: 'estudios', component: Estudios},
  { path: 'formulario', component: EstudiosFormularios},
  { path: 'estudios/:id', component: EstudioDetalle},
  { path: 'estudios/:id/editar', component: EstudiosFormularios},
  { path: 'auth/password/:token', component: RecuperarPass}

];  