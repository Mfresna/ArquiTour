import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, Observable, switchMap } from 'rxjs';
import { fechaNacValidador } from '../../../auth/validadores/fechaValidador';
import { nombreValidador, apellidoValidador } from '../../../auth/validadores/textoValidador';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { DragZoneSimple } from '../../../components/drag-zone-simple/drag-zone-simple';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';
import { TieneCambiosPendientes } from '../../../guards/salirSinGuardar/salir-sin-guardar-guard';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { RolModelDescripcion } from '../../../models/usuarioModels/rolModels';


@Component({
  selector: 'app-usuario-detalle',
  imports: [ReactiveFormsModule, DragZoneSimple,EsperandoModal, MensajeModal],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css',
})
export class UsuarioDetalle implements OnInit, AfterViewInit, TieneCambiosPendientes{

  perfilForm!: FormGroup;

  titulo: string = 'PERFIL DE USUARIO'

  id!: number;
  emailRegistrado!: string;
  nombre!: string;
  apellido!: string;
  roles!: RolesEnum[]
  rolModelDescripcion = RolModelDescripcion;

  miPerfil: boolean = false;
  
  imagenUrlExistente!: string;
  nuevaImagen: File | null = null;
  quitadoImg: boolean = false;

  editando: boolean = false;

  spinerVisible: boolean = false;
  spinerMensaje!: string;

  imagenDefecto = `${environment.imgUsuario}`;

    //EMITERS
  @Output() volverEmit = new EventEmitter<void>();

    //COMPONENTE DE IMAGEN
  @ViewChild('campoImagen') campoImagen!: DragZoneSimple;

  // MODAL
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';
  redirigirDespues: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location   
  ) {}

   // ---------------- MODAL ----------------

  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    redirigirA: string | null = null
  ) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
    this.redirigirDespues = redirigirA;
  }

  onModalAceptar() {
    this.modalVisible = false;

    if (this.redirigirDespues) {
      this.router.navigate([this.redirigirDespues]);
    }

    this.redirigirDespues = null;
  }

  onModalCerrado() {
    this.modalVisible = false;
  }

  tieneCambiosPendientes(): boolean {
    // Si todavía no existe el form, no hay cambios
    if (!this.perfilForm) return false;

    // Si no está en modo edición, no sale el cartel
    if (!this.editando) return false;

    // Si está en edición y el form fue modificado
    return this.perfilForm.dirty;
  }
  
  ngOnInit(): void {
    this.perfilForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        nombre: [{ value: '', disabled: true }, [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(50),  
          nombreValidador]],
        apellido: [{ value: '', disabled: true }, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50), 
          apellidoValidador
        ]],
        fechaNacimiento: [{ value: '', disabled: true }, [
          Validators.required,
          fechaNacValidador(5)
        ]],
        descripcion: [{ value: '', disabled: true }, [
          Validators.maxLength(280),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡&\s\.,]+$/)
        ]],
        imagenUrl:[{ value: '', disabled: true },[]]
      }
    );

    //Carga los Datos
    const idParam = this.route.snapshot.params['id'];
    idParam ? this.cargarusuario(idParam) : this.cargarMe();

  }

  ngAfterViewInit(): void {
    //Esto carga el componente del hijo
  }

//========================== REGISTRO EN EL FORMULARIO

  accionBoton(){
    if(!this.editando){
      //estoy MODIFICANDO
      this.editando = true;
      this.habilitarCampos();

    }else{
      //Ya Modifique estoy GUARDANDO
      this.actualizarme();
    }

  }

  cambiarPass(){
    this.router.navigate(['/cambiarpass']);
  }

//========================== PASOS DE ACTUALIZACION
  private actualizarme() {

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.spinerVisible = true;
    this.spinerMensaje = "Actualizando Usuario...";


    this.verficiarImgNueva();

    const formularioCompleto = {
      ...this.perfilForm.getRawValue(),
      id: this.id
    };

    this.usuarioService.actualizarPerfil(formularioCompleto).pipe(
      finalize(() => {
        this.deshabilitarCampos();
        this.editando = false;
        this.spinerVisible=false; 
      })
    ).subscribe({
      next: ()=>{
        //Recarga las Variables
        const idParam = this.route.snapshot.params['id'];
        idParam ? this.cargarusuario(idParam) : this.cargarMe();

        this.mostrarModal(
          "Perfil actualizado",
          "Los datos se han actualizado correctamente.",
          "success"
        );
      },
      error: (e) => {
        if(e.status === 400){
          //BAD_REQUEST
          this.mostrarModal("Datos inválidos", "Revisá los campos cargados.", "warning");
        }else if(e.status === 403){
          //FORBBIDEN
          this.mostrarModal("Acceso denegado", "No tenés permiso para modificar este usuario.", "error", "/");
        }else {
          this.mostrarModal("Error inesperado", "No se pudo actualizar el perfil.", "error");
        }
      }
    });

  }

  //============================ ACTUALIZACION DE IMAGEN

  private verficiarImgNueva(){
    if (this.nuevaImagen) {
      //HAY FOTO NUEVA
      this.actualizarFotoPerfil();
    } else if(this.imagenUrlExistente && this.quitadoImg) {
      //HABIA IMG Y LA SACARON
      this.borrarImg();
    }
  }

  private actualizarFotoPerfil() {
    this.subirImg().pipe(
      // subirImg devuelve la URL de la imagen
      switchMap((url) => {
        return this.usuarioService.actualizarFotoPerfil(url);
      })
    ).subscribe({
      next: () => {console.log("IMG SUBIDA");},
      error: (e) => {
        console.error(e)
        if(e.status === 400){
          //BAD_REQUEST
          this.mostrarModal("Imagen inválida", "Verificá el archivo cargado.", "warning");
        }else if(e.status === 415){
          //UNSUPPORTED_MEDIA_TYPE
           this.mostrarModal("Formato no válido", "Sólo se permiten imágenes JPG/PNG/WEBP.", "error");
        }else{
            this.mostrarModal("Error al subir imagen", "No se pudo actualizar la imagen.", "error");
        }
      }
    });
  }

  private subirImg(): Observable<string> {
    return this.imagenService.subirImagen([this.nuevaImagen!]).pipe(
      map(urls => urls[0])
    );
  }

  private borrarImg(){
    this.usuarioService.borrarFotoPerfil().subscribe({
      next: () =>{console.log("Img Borrada Exitosamente")},
      error: () => {
        this.mostrarModal("Error", "No se pudo borrar la imagen.", "error");
      }
    })
  }
  
//===================================================

  //HABILITAR CAMPOS
  private habilitarCampos(){
    this.perfilForm.enable();
    this.perfilForm.get('email')?.disable();
  }

  private deshabilitarCampos(){
    this.perfilForm.disable();
  }

  //LIMITA LA CANTIDAD DE LINEAS DEL TEXTAREA
  limitarLineas(event: Event, maxLineas: number) {
    const textarea = event.target as HTMLTextAreaElement;
    const lineas = textarea.value.split('\n');
    if (lineas.length > maxLineas) {
      textarea.value = lineas.slice(0, maxLineas).join('\n');
      this.perfilForm.get('descripcion')?.setValue(textarea.value);
    }
  }

//===================================================
  //CARGAR DATOS

  private cargarMe(){
    this.titulo = 'MI PERFIL';

    this.usuarioService.getUsuarioMe().subscribe({
      next: (item) => {
        this.miPerfil = true;
        this.cargarDatos(item);
      },
      error: (e) => {
        this.mostrarModal(
          "Error al cargar",
          "No se pudieron cargar los datos de tu perfil.",
          "error",
          "/"
        );

      }
    });
  }

  private cargarusuario(id: string){
    this.usuarioService.getUsuario(id).subscribe({
      next: (item) => {
        this.cargarDatos(item);
      },
      error: (e) => {
       this.mostrarModal(
          "Usuario no encontrado",
          "El usuario solicitado no existe.",
          "warning",
          "/usuarios"
        );
      }
    });
  }

  private cargarDatos(item: UsuarioModel){
    this.perfilForm.patchValue(item);
        
    this.id = item.id;
    this.emailRegistrado = item.email;
    this.nombre = item.nombre;
    this.apellido = item.apellido;
    this.imagenUrlExistente = item.urlImagen;
    this.roles = this.getRolesEnumValidos(item.roles);

    this.nuevaImagen = null;
    this.quitadoImg = false;
  }

  cargarImg(url: string): string | null{
    if(url){
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${environment.apiUrl}${path}`;
    }
    return null;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;
    img.src = `${location.origin}/${this.imagenDefecto.replace(/^\/+/, '')}`;
  }

  volver(){
    this.location.back();
  }


  //ROLES
  getRolesEnumValidos(roles: string[]): RolesEnum[] {
    if (!roles || roles.length === 0) return [];

    return roles
      .filter(r => Object.values(RolesEnum).includes(r as RolesEnum))
      .map(r => r as RolesEnum);
  }

}