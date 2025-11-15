import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Auth } from './auth/pages/autenticacion/auth';
import { Component } from '@angular/core';
import { Estudios } from './pages/estudios/estudios/estudios';
import { EstudioDetalle } from './pages/estudios/estudio-detalle/estudio-detalle';
import { CambiarPass } from './auth/pages/cambiar-pass/cambiar-pass';
import { EstudioForm } from './pages/estudios/estudio-form/estudio-form';

import { ObraDetalle } from './pages/obras/obra-detalle/obra-detalle';
import { Register } from './auth/pages/register/register';
import { ObraForm } from './pages/obras/obra-form/obra-form';
import { Favoritos } from './pages/favoritos/favoritos/favoritos';
import { Obras } from './pages/obras/obras/obras';
import { UsuarioDetalle } from './pages/usuarios/usuario-detalle/usuario-detalle';




export const routes: Routes = [
  
  { path: '', component: Auth },
  { path: 'login', component: Auth},
  { path: 'registro', component: Auth},
  { path: 'auth/password/:token', component: CambiarPass},  //Caundo recibo el Mail para recuperar la cuenta

  //======= APLICAR GUARDS =========//
  { path: 'cambiarpass', component: CambiarPass},  //Cuando el ADM maestro debe cambiar la pass
  { path: 'home', component: Estudios},
  


  { path: 'estudios', component: Estudios},
  { path: 'formulario', component: EstudioForm},
  { path: 'estudios/:id', component: EstudioDetalle},
  { path: 'estudios/:id/editar', component: EstudioForm},
  { path: 'obras', component: Obras},
  { path: 'formularioOb', component: ObraForm},
  { path: 'obras/:id', component: ObraDetalle},
  { path: 'obras/:id/editar', component: ObraForm},
  { path: 'favoritos', component: Favoritos},

  { path: 'usuario', component: UsuarioDetalle},
  { path: 'usuario/:id', component: UsuarioDetalle},


  { path: 'prueba', component: Register}
];  