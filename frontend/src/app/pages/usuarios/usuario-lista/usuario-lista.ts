import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { CategoriaObraModel, CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraModel, EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraService } from '../../../services/obraService/obra-service';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';
import { RolModelDescripcion } from '../../../models/usuarioModels/rolModels';
import { SelectRoles } from "../../../components/select-roles/select-roles";
import { finalize, tap } from 'rxjs';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';

@Component({
  selector: 'app-usuario-lista',
  imports: [ReactiveFormsModule, SelectRoles, EsperandoModal],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.css',
})
export class UsuarioLista implements OnInit {

  filtroForm!: FormGroup;

  roles = Object.values(RolesEnum);
  RolModelDescripcion = RolModelDescripcion;

  usuarios!: UsuarioModel[];

  mostrarSelectorRoles = false;
  usuarioSeleccionado: UsuarioModel | null = null;

  spinerVisible: boolean = false;
  spinerMensaje!: string;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      nombre: ['',[]],
      apellido: ['',[]],
      email: ['',[]],
      isActivo: ['',[]],
      rol: ['',[]],
    });

    this.cargarUsuarios();
  }


  cargarUsuarios() {

    const usauriosFiltros = this.filtroForm.value;

    this.usuarioService.getUsuarios(
      usauriosFiltros.nombre?.trim() || null,
      usauriosFiltros.apellido?.trim() || null,
      usauriosFiltros.email?.trim() || null,
      usauriosFiltros.isActivo,
      usauriosFiltros.rol || null
    )
    .subscribe({
      next: (lista: UsuarioModel[]) =>{
        this.usuarios = lista;
      }, 
      error: (e) => {
        console.warn(e)
        alert('No se pudo cargar la lista de usurios');
      }
    });
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      rol: null,
      isActivo: null
    });

    this.cargarUsuarios();
  }

  getDescripcionRol(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Error en el Rol';

    const rolesValidos = roles.filter(r =>
      Object.values(RolesEnum).includes(r as RolesEnum)
    ) as RolesEnum[];

    //No posee roles validos
    if (rolesValidos.length === 0) return 'Error en el Rol';

    const descripciones = rolesValidos
      .filter(r => r !== RolesEnum.ROLE_USUARIO)
      .map(r => RolModelDescripcion[r]);

    if (descripciones.length === 0) return 'Basico';

    return descripciones.join(' y ');
  }

  irDetalleUsuario(id: number):void{
    if(!this.mostrarSelectorRoles){
      //Solo redirigime si no estoy mostrando el selector
      this.router.navigate(['/usuario', id]);
    }
  }

  getRolesEnumValidos(roles: string[]): RolesEnum[] {
    if (!roles || roles.length === 0) return [];

    return roles
      .filter(r => Object.values(RolesEnum).includes(r as RolesEnum))
      .map(r => r as RolesEnum);
  }


  CambiarEstadoCuenta(usuario: UsuarioModel):void{
    this.usuarioService.cambiarEstadoCuenta(usuario.id, usuario.activo)
      .subscribe({
        next: (resp) => {
          ///Actualiza dinamicamente el listado
          usuario.activo = resp.activo;
        },
        error: (e) => {
          alert("No podes cambiarle el Estado");
          console.error('Error cambiando estado', e);
        }
      });
  }

  abrirSelectorRoles(event: MouseEvent, usuario: UsuarioModel): void {
      //previene propagacion
    event.stopPropagation();
    event.preventDefault();

    this.usuarioSeleccionado = usuario;
    this.mostrarSelectorRoles = true;
  }


  //===================================================================

  cambiosDeRoles(event: { 
      id: number; 
      rolesAgregar: RolesEnum[]; 
      rolesBorrar: RolesEnum[]; }): void {

      this.spinerMensaje="Actualizando Roles"

      //convierte lo recibido por le hijo
    const { id, rolesAgregar, rolesBorrar } = event;

    if (rolesAgregar.length) {
      this.usuarioService.agregarRoles(id, { roles: rolesAgregar }).pipe(
        tap(()=>{this.spinerVisible=true;}),
        finalize(()=>{this.spinerVisible=false})
      ).subscribe({
        next: (usrActualizado) => {
          this.actualizarUsuarioEnLista(usrActualizado);
        },
        error: (e)=>{
          console.error(e);

          if(e.status === 409){
            alert("No se puede auto asignar roles. Contacte con otro administrador");
          }else if(e.status === 403){
            alert("No se le puede cambiar los roles a un usurio desactivado");
          }else{
            alert("Su solicitud no pudo ser procesada.");
          }
        }
      });
    }

    if (rolesBorrar.length) {
      this.usuarioService.quitarRoles(id, { roles: rolesBorrar }).pipe(
        tap(()=>{this.spinerVisible=true;}),
        finalize(()=>{this.spinerVisible=false})
      ).subscribe({
        next: usrActualizado => {
          this.actualizarUsuarioEnLista(usrActualizado);
        },
        error: (e)=>{
          console.error(e);

          if(e.status === 409){
            alert("No se puede auto-revocar roles. Contacte con otro administrador");
          }else if(e.status === 403){
            alert("No se le puede cambiar los roles a un usurio desactivado");
          }else if(e.status === 400){
            //no deberia ejecutarse porque esta capeado por front pero evita request interception
            alert("El Rol Usuario no puede ser Revocado");
          }else if(e.status === 422){
            alert("Al usuario maestro no se le pueden revocar los permisos");
          }else{
            alert("Su solicitud no pudo ser procesada.");
          }
        }
      });
    }

    //  Apago el Spiner por las duras
    this.spinerVisible=false

    // Cerrar el selector
    this.mostrarSelectorRoles = false;
    this.usuarioSeleccionado = null;
  }

  private actualizarUsuarioEnLista(usrActualizado: UsuarioModel): void {
    const idx = this.usuarios.findIndex(u => u.id === usrActualizado.id);
    if (idx !== -1) {
      this.usuarios[idx] = usrActualizado;
    }
  }

  cerrarSelector(){
    //Solo cierra el elemento de recibir los cambios y subirlos 
    // se encarga otro metodo
    this.mostrarSelectorRoles = false;
    this.usuarioSeleccionado = null;
  }



}
