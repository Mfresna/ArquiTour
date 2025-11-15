import { AfterViewInit, Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, Observable, switchMap, throwError } from 'rxjs';
import { PinService } from '../../../auth/services/pinService/pin-service';
import { fechaNacValidador } from '../../../auth/validadores/fechaValidador';
import { CamposIguales } from '../../../auth/validadores/igualdadValidador';
import { caracteresValidador } from '../../../auth/validadores/passCaracteresValidador';
import { nombreValidador, apellidoValidador } from '../../../auth/validadores/textoValidador';
import { DragZoneImagenes } from '../../../components/drag-zone-imagenes/drag-zone-imagenes';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { PinVerificador } from '../../../auth/components/pin/pin-verificador';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { DragZoneSimple } from '../../../components/drag-zone-simple/drag-zone-simple';


@Component({
  selector: 'app-usuario-detalle',
  imports: [ReactiveFormsModule, DragZoneSimple,EsperandoModal],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css',
})
export class UsuarioDetalle implements OnInit, AfterViewInit{

  perfilForm!: FormGroup;

  id!: number;
  emailRegistrado!: string;
  nombre!: string;
  apellido!: string;

  imagenUrlExistente!: string;
  nuevaImagen: File | null = null;

  editando: boolean = false;

  spinerVisible: boolean = false;
  spinerMensaje!: string;

    //EMITERS
  @Output() volverEmit = new EventEmitter<void>();

    //COMPONENTE DE IMAGEN
  @ViewChild('campoImagen') campoImagen!: DragZoneImagenes;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router,
    private route: ActivatedRoute,
    private pinService: PinService    
  ) {}
  
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
      this.registrarme();

      this.deshabilitarCampos()
    }

  }

  cambiarPass(){
    this.router.navigate(['/cambiarpass']);
  }

//========================== PASOS DE REGISTRACION
  private registrarme(){

    if (this.perfilForm.invalid) {
      alert("invalido")
      this.perfilForm.markAllAsTouched();
    }else{
      this.verficiarImgNueva();

      this.spinerVisible=true;
      this.spinerMensaje="Actualizando Usuario..."

      const formularioCompleto = {
        ...this.perfilForm.getRawValue(),
        id: this.id                       
      };
     
      this.usuarioService.actualizarPerfil(formularioCompleto).pipe(
        finalize(() => this.spinerVisible=false)
      ).subscribe({
        next: ()=>{
          alert("Usuario Actualizado Correctamente");
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
      })

    }      
  }

  private verficiarImgNueva(){
    if(this.nuevaImagen){
        this.actualizarImg().subscribe({
          next: (url) => {
            this.perfilForm.get('imagenUrl')?.setValue(url);
          },
          error: (e) => {
            //===========ERRORES DE IMAGEN
            if(e.status === 400){
            //BAD_REQUEST
            alert("Verifique la imagen, su nombre y su extension.")

            }else if(e.status === 415){
              //UNSUPPORTED_MEDIA_TYPE
              alert("El tipo de archivo no es soportado, solo se pueden cargar imagenes");
            }
          }
        });
      }else{
        //Seteo la misma foto que tenia
        alert(this.imagenUrlExistente)
        this.perfilForm.get('imagenUrl')?.setValue(this.imagenUrlExistente);
      }
  }

  private actualizarImg(): Observable<string> {

    return this.imagenService.subirImagen([this.nuevaImagen!]).pipe(
      map(urls => urls[0]),
      switchMap(urlImagen =>
        this.usuarioService.actualizarFotoPerfil(urlImagen).pipe(
          map(() => urlImagen)
        )
      ),
      catchError((err) => {
        console.error("Error en la Actualizacion de la iamgen", err);
        return throwError(() => err);
      })
    );

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
  //HABILITAR CAMPOS
  private cargarMe(){
    this.usuarioService.getUsuarioMe().subscribe({
      next: (item) => {
        this.perfilForm.patchValue(item);

        this.id = item.id;
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen
      },
      error: (e) => {
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
        this.imagenUrlExistente = item.urlImagen
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
      }
    });
  }



}