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


@Component({
  selector: 'app-usuario-detalle',
  imports: [ReactiveFormsModule, DragZoneSimple,EsperandoModal],
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

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location   
  ) {}

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
      },
      error: (e) => {
        if(e.status === 400){
          //BAD_REQUEST
          alert("Error en los Datos cargados")
        }else if(e.status === 403){
          //FORBBIDEN
          alert("El usuario no se puede modificar");
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
          alert("Verifique la imagen, su nombre y su extension.")
        }else if(e.status === 415){
          //UNSUPPORTED_MEDIA_TYPE
          alert("El tipo de archivo no es soportado, solo se pueden cargar imagenes");
        }else{
          alert("El proceso de subir la Imagen Fallo.")
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
      error: (e) => {console.error("ERROR al borrar la img", e)}
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
        
        this.perfilForm.patchValue(item);

        this.id = item.id;
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen;


        this.nuevaImagen = null;
        this.quitadoImg = false;

      },
      error: (e) => {
        alert("No se pueden cargar los datos de perfil");
        console.error("No se puede leer el usuario", e);

      }
    });
  }

  private cargarusuario(id: string){
    this.usuarioService.getUsuario(id).subscribe({
      next: (item) => {
        this.perfilForm.patchValue(item);
        
        this.id = item.id;
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen;

        this.nuevaImagen = null;
        this.quitadoImg = false;

      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
      }
    });
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


}