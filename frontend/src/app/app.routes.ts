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
import { FavoritosDetalle } from './pages/favoritos/favoritos-detalle/favoritos-detalle';
import { UsuarioLista } from './pages/usuarios/usuario-lista/usuario-lista';
import { authGuard } from './guards/auth/auth-guard';
import { noAuthGuard } from './guards/noAuth/no-auth-guard';
import { rolesGuard } from './guards/roles/roles-guard';
import { salirSinGuardarGuard } from './guards/salirSinGuardar/salir-sin-guardar-guard';
import { NotFound } from './pages/not-found/not-found';
import { MapaPrincipal } from './pages/mapa-principal/mapa-principal';
import { MapaCompleto } from './pages/mapa-completo/mapa-completo';




export const routes: Routes = [
  {path:'mapa2', component:MapaCompleto},

  {path:'mapa', component: MapaPrincipal},

  //======= RUTAS PÚBLICAS =========//
  { path: '', component: Auth, canActivate: [noAuthGuard] },
  { path: 'login', component: Auth, canActivate: [noAuthGuard]},
  { path: 'registro', component: Auth, canActivate: [noAuthGuard]},
  { path: 'auth/password/:token', component: CambiarPass, canActivate: [noAuthGuard]},  //Caundo recibo el Mail para recuperar la cuenta


  //======= APLICAR GUARDS =========//

  { path: 'cambiarpass', component: CambiarPass, canActivate: [authGuard]},  //Cuando el ADM maestro debe cambiar la pass
  { path: 'home', component: Obras, canActivate: [authGuard]},
  {path:'mapa', component: MapaPrincipal, canActivate: [authGuard]},
  

  //Estudios

  { path: 'formEstudios', component: EstudioForm, canActivate: [rolesGuard],canDeactivate: [salirSinGuardarGuard],  data: {roles: ['ROLE_ADMINISTRADOR', 'ROLE_ARQUITECTO']}},
  { path: 'estudios', component: Estudios, canActivate: [authGuard]},
  { path: 'estudios/:id', component: EstudioDetalle, canActivate: [authGuard]},
  { path: 'estudios/:id/editar', component: EstudioForm, canActivate: [rolesGuard],canDeactivate: [salirSinGuardarGuard], data: {roles: ['ROLE_ADMINISTRADOR', 'ROLE_ARQUITECTO']}},

  //Obras

  { path: 'obras', component: Obras, canActivate: [authGuard]},
  { path: 'formObras', component: ObraForm, canActivate: [rolesGuard],canDeactivate: [salirSinGuardarGuard], data: {roles: ['ROLE_ADMINISTRADOR', 'ROLE_ARQUITECTO']}},
  { path: 'obras/:id', component: ObraDetalle, canActivate: [authGuard]},
  { path: 'obras/:id/editar', component: ObraForm, canActivate: [rolesGuard],canDeactivate: [salirSinGuardarGuard], data: {roles: ['ROLE_ADMINISTRADOR', 'ROLE_ARQUITECTO']}},

  //Favoritos

  { path: 'favoritos', component: Favoritos, canActivate: [authGuard]},
  { path: 'favoritos/:id', component: FavoritosDetalle, canActivate: [authGuard]},

  //Ver Perfil Usuario
  { path: 'me', component: UsuarioDetalle, canActivate: [authGuard], canDeactivate: [salirSinGuardarGuard]},
  { path: 'usuario/:id', component: UsuarioDetalle, canActivate: [rolesGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},

  //Gestionar Usuarios
  { path: 'gestionar-usuarios', component: UsuarioLista, canActivate: [rolesGuard], data: {roles: ['ROLE_ADMINISTRADOR']} },
  
  //Por Defecto
  { path: '**', component: NotFound }


  

];  