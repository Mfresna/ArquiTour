import {AfterViewInit, Component, EventEmitter, OnInit, Output, signal, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { PinVerificador } from '../../components/pin/pin-verificador';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { PinService } from '../../services/pinService/pin-service';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { caracteresValidador } from '../../validadores/passCaracteresValidador';
import { CamposIguales } from '../../validadores/igualdadValidador';
import { apellidoValidador, nombreValidador } from '../../validadores/textoValidador';
import { fechaNacValidador } from '../../validadores/fechaValidador';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { DragZoneSimple } from "../../../components/drag-zone-simple/drag-zone-simple";
import { MensajeModal } from '../../../components/mensaje-modal/mensaje-modal';


type Paso = "email" | "pin" | "registrarme";
type DestinoRedireccion = 'login' | 'inicio' | null;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, PinVerificador, EsperandoModal, DragZoneSimple, MensajeModal],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, AfterViewInit{

  registerForm!: FormGroup;

  mostrarPassword = false;
  mostrarConfirmPassword = false;

  textoBoton: string = "SIGUIENTE";
  habilitarBtnSubmit: boolean = false;
  paso = signal<Paso>('email');

  spinerVisible: boolean = false;
  spinerMensaje!: string;

  pinInvalido: boolean = false;

  emailVerificado!: string

    //EMITERS
  @Output() volverEmit = new EventEmitter<void>();

    //COMPONENTE DE IMAGEN
  @ViewChild('campoImagen') campoImagen!: DragZoneSimple;

  //MODAL
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  redirigirDestino: DestinoRedireccion = null; //para saber si el botón Aceptar debe ir al login

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private pinService: PinService,
    private imagenService: ImagenService
  ) {}

  
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        nuevaPass: ['', [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@._!+\-]{6,}$/),
            caracteresValidador]
          ],
        confirmaPass: ['', [
            Validators.required,
            Validators.min(0),
            caracteresValidador]
          ],
        nombre: ['', [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(50),  
          nombreValidador]],
        apellido: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50), 
          apellidoValidador
        ]],
        fechaNacimiento: ['', [
          Validators.required,
          fechaNacValidador(5)
        ]],
        descripcion: ['', [
          Validators.maxLength(280),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡&\s\.,]+$/)
        ]],
        imagenUrl:['',[]]
      },
      {validators: CamposIguales('nuevaPass', 'confirmaPass')}
    );

    this.subIniciales();
  }

  ngAfterViewInit(): void {
    //Esto carga el componente del hijo
  }

  volver(): void {
    //Emite que se apreto el boton, sirve en el authPage para saber que mostrar
    this.volverEmit.emit();
  }

// ============================== MODAL 

  private mostrarModal(titulo: string, mensaje: string, destino: DestinoRedireccion = null): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalVisible = true;
    this.redirigirDestino = destino;
  }

  onModalAceptar(): void {
    this.modalVisible = false;

    if (this.redirigirDestino === 'login') {
      this.router.navigate(['/login']);
    } else if (this.redirigirDestino === 'inicio') {
      this.router.navigate(['']);
    }

    this.redirigirDestino = null;
  }

  onModalCerrado(): void {
    this.modalVisible = false;
    this.redirigirDestino = null;
  }

//========================== REGISTRO EN EL FORMULARIO

  accionBoton(){
    switch (this.paso()) {
      case 'email':
        this.enviarPin();
        break;

      case 'pin':
        this.verificarPin();
        break;

      case 'registrarme':
        //this.registrarme();
        this.registrarme();
        break;

      default:
        console.error("Paso fuera del rango: ", this.paso);
    }
  }

  toggleBotonPrincipal(){
    this.habilitarBtnSubmit = !this.habilitarBtnSubmit
  }

//========================== PASOS DE REGISTRACION
  private enviarPin(){

    this.spinerVisible=true;  //muestro la espera
    this.spinerMensaje="Enviando PIN al Email..."

    this.pinService.enviarPin(this.registerForm.get('email')?.value).pipe(
      finalize(() => this.spinerVisible=false)
    ).subscribe({
      next: () => {
        this.siguientePaso();
      },
      error: (e) => {
        if (e.status === 409) {
          this.mostrarModal(
            "Email registrado",
            "El mail ya se encuentra registrado en la base de datos.",
            "login"
          );
          console.warn(e);

        } else if(e.status === 423) {
          this.mostrarModal(
            "Demasiadas solicitudes",
            "Aguarde un momento antes de enviar un nuevo PIN."
          );
          console.warn(e);

        }else if(e.status >= 500){
          this.mostrarModal(
            "Error del servicio",
            "ERROR del Servicio, intente más tarde."
          );
          console.warn(e);

        } else{
          this.mostrarModal(
            "Error inesperado",
            "Ocurrió un error inesperado."
          );
          console.warn(e);
        }
      }
    });

  }

  private verificarPin(){

    this.spinerVisible=true;  //muestro la espera
    this.spinerMensaje="Verificando PIN..."

    this.pinService.validarPin(
      this.registerForm.get('email')?.value,
      this.registerForm.get('pin')?.value
    ).pipe(
      finalize(() => this.spinerVisible=false)
    ).subscribe({
      next: () => {
        this.emailVerificado = this.registerForm.get('email')?.value;
        this.siguientePaso();
      },
      error: (e) => {
        if (e.status === 409) {
          //CONFLICT
          this.mostrarModal(
            "PIN caducado",
            "El PIN caducó. Debe generar uno nuevo."
          );
          this.anteriorPaso();

          console.warn(e);

        } else if(e.status === 410) {
          //GONE
          this.mostrarModal(
            "Demasiados intentos",
            "Espere para volver a generar un PIN."
          );
          this.anteriorPaso();
          console.warn(e);

        }else if(e.status === 403) {
          //FORBBIDEN
          this.mostrarModal(
            "Solicitud inválida",
            "Error en la solicitud. Será redirigido al inicio.",
            "inicio"
          );
          console.warn(e);

        } else if(e.status === 406) {
          //NOT ACCEPTABLE
          this.pinInvalido = true;
          console.warn(e);

        }else if(e.status >= 500){
          this.mostrarModal(
            "Error del servicio",
            "Intente más tarde."
          );
          console.warn(e);

        } else{
          this.mostrarModal(
            "Error inesperado",
            "Ocurrió un error inesperado."
          );
          console.warn(e);
        }
      }
    });
  }

  private registrarme(){

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
    }else{
      this.spinerVisible=true;  //muestro la espera
      this.spinerMensaje="Almacenando la Informacion..." 

      this.habilitarEmail();

      //Por seguridad ante manipulaciones seteo antes del envio el mail almacenado
      this.registerForm.get('email')?.setValue(this.emailVerificado);

      
      const archivoImg = this.campoImagen?.obtenerArchivoActual();

      this.usuarioService.crearUsuario(this.registerForm.value,archivoImg).pipe(
        finalize(() => {
          this.spinerVisible=false;
          this.habilitarEmail();
        })
      ).subscribe({
        next: () => {
          this.mostrarModal(
            "Registro exitoso",
            "REGISTRADO EXITOSAMENTE",
            "login"
          );
          this.registerForm.reset();
        },
        error: (e) =>{
          //============== ERRORES DE SUBIR IMAGEN
          if(e.status === 400){
            //BAD_REQUEST
            this.mostrarModal(
              "Imagen inválida",
              "Verifique la imagen, su nombre y su extensión."
            );
          }else if(e.status === 415){
            //UNSUPPORTED_MEDIA_TYPE
             this.mostrarModal(
              "Tipo de archivo no soportado",
              "El tipo de archivo no es soportado, solo se pueden cargar imágenes."
            );
          }
          
          //============= ERRORES DE REGISTRAR USUARIOS
          if (e.status === 422) {
            //UNPROCESSABLE ENTITY
            console.error("El Email ya existe. Peticion imposible de resolver", e);

            this.mostrarModal(
              "Email ya registrado",
              "El email ya existe en el sistema.",
              'inicio'
            );

          } else if(e.status === 403) {
            //FORBBIDEN
            console.warn(e);
            this.mostrarModal(
              "Email no verificado",
              "El email no ha sido verificado."
            );

            this.origenPaso();
            this.registerForm.get('email')?.setValue(this.emailVerificado);

          }else if(e.status >= 500){
            this.mostrarModal(
              "Error del servicio",
              "ERROR del Servicio, intente más tarde.",
              "inicio"
            );
            console.warn(e);

         

          } else{
             this.mostrarModal(
              "Error",
              "ERROR INESPERADO.",
              "inicio"
            );
            console.warn(e);
            
            this.origenPaso();

          }
        }
      });      
    }
  }
//===================================================

  //HABILITAR ESTADO DE MAIL
  private deshabilitarEmail(){
    this.registerForm.get('email')?.disable();
  }

  private habilitarEmail(){
    this.registerForm.get('email')?.enable();
  }

  //SUBSCRIPCIONES PARA EL COMPORTAMIENTO DEL BOTON
  private subIniciales(){
    
    //Se suscribe a los cambios de estado de los Input que marcan 
    // un cambio de estado en el btnPrincipal

    //Elemento de control
    const emailControl = this.registerForm.get('email')
    const pinControl = this.registerForm.get('pin');

      //Campo Email
    emailControl?.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        //Solo cuando el mail sea valido se habilita el boton
        this.habilitarBtnSubmit = true;
      }else{
        this.habilitarBtnSubmit = false;
      }
    });

      //Campo PIN
    pinControl?.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        //Solo cuando el mail sea valido se habilita el boton
        this.habilitarBtnSubmit = true;
      }else{
        this.habilitarBtnSubmit = false;
      }
    });

      //Todo el formulario
    this.registerForm.statusChanges.subscribe(status => {
      if (status === 'VALID' && this.paso() === 'registrarme') {
        this.habilitarBtnSubmit = true;
      } else if(this.paso() === 'registrarme') {
          //solo si es etapa de registro
        this.habilitarBtnSubmit = false;
      }
    });

  
  }

  //SIGNALS DE PASOS
  siguientePaso() {
    this.deshabilitarEmail();//Deshabilita el Email

    if (this.paso() === 'email'){
      this.paso.set('pin');
      this.habilitarBtnSubmit = false;
      this.textoBoton = "VALIDAR PIN"

    } else if (this.paso() === 'pin'){
      this.paso.set('registrarme');
      this.habilitarBtnSubmit = false;
      this.textoBoton = "REGISTRARME"

    } 
  }

  anteriorPaso() {
    if (this.paso() === 'pin'){
      this.paso.set('email');
      this.habilitarBtnSubmit = false;
      
      this.textoBoton = "SIGUIENTE"

      this.habilitarEmail();//Habilita el Email

    } else if (this.paso() === 'registrarme'){
      this.paso.set('pin');
      this.habilitarBtnSubmit = false;

      this.textoBoton = "VALIDAR PIN"

      this.habilitarEmail();//Habilita el Email
    } 
  }

  origenPaso(){
    this.paso.set('email');
    this.habilitarBtnSubmit = false;
    this.textoBoton = "SIGUIENTE";
    this.registerForm.reset();
  }

  //RECIBE PIN DEL COMPONENTE
  reciboPinCompleto(pin: string) {
    this.registerForm.get('pin')?.setValue(pin);
    console.log('PIN recibido:', pin);
  }

  recibioPinIncompleto(){
    this.registerForm.get('pin')?.setValue('');
  }

  //LIMITA LA CANTIDAD DE LINEAS DEL TEXTAREA
  limitarLineas(event: Event, maxLineas: number) {
    const textarea = event.target as HTMLTextAreaElement;
    const lineas = textarea.value.split('\n');
    if (lineas.length > maxLineas) {
      textarea.value = lineas.slice(0, maxLineas).join('\n');
      this.registerForm.get('descripcion')?.setValue(textarea.value);
    }
  }

  
}

