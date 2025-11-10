import {Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { PinVerificador } from '../../components/pin/pin-verificador';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { PinService } from '../../services/pinService/pin-service';
import { finalize, tap } from 'rxjs/operators';
import { SelectorContext } from '@angular/compiler';


type Paso = "email" | "pin" | "registrarme";

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, PinVerificador, EsperandoModal],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit{

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private pinService: PinService
  ) {}
  
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      nuevaPass: ['', [Validators.required]],
      confirmaPass: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });

    this.subIniciales();
  }  

  registrarse(){
    alert(this.registerForm.get('pin')?.value)
  }


  volver(): void {
    //Emite que se apreto el boton, sirve en el authPage para saber que mostrar
    this.volverEmit.emit();
  }


  toggleBotonPrincipal(){
    this.habilitarBtnSubmit = !this.habilitarBtnSubmit
  }

  accionBoton(){
    switch (this.paso()) {
      case 'email':
        this.enviarPin();
        break;

      case 'pin':
        this.verificarPin();
        break;

      case 'registrarme':
        this.registrarme();
        break;

      default:
        console.error("Paso fuera del rango: ", this.paso);
    }
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
          alert("El mail ya se encuentra registrado en la base de datos.");
          this.router.navigate(['/login']);
          console.warn(e);

        } else if(e.status === 423) {
          alert("Aguarde para enviar un nuevo PIN.");
          console.warn(e);

        }else if(e.status >= 500){
          alert("ERROR del Servicio, intente mas tarde.");
          console.warn(e);

        } else{
          alert("ERROR INESPERADO.");
          console.warn(e);
        }
      }
    })

  }

  private verificarPin(){

    this.spinerVisible=true;  //muestro la espera
    this.spinerMensaje="Verificando PIN..."

    alert(this.registerForm.get('email')?.value.toString())

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
          alert("El PIN caducó.");
          this.anteriorPaso();

          console.warn(e);

        } else if(e.status === 410) {
          //GONE
          alert("Demasiados Intentos vuelva a generar un PIN");
          this.anteriorPaso();
          console.warn(e);

        }else if(e.status === 403) {
          //FORBBIDEN
          alert("Error en la solicitud");
          this.router.navigate(['']);
          console.warn(e);

        } else if(e.status === 406) {
          //NOT ACCEPTABLE
          this.pinInvalido = true;
          console.warn(e);

        }else if(e.status >= 500){
          alert("ERROR del Servicio, intente mas tarde.");
          console.warn(e);

        } else{
          alert("ERROR INESPERADO.");
          console.warn(e);
        }
      }
    })
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

      console.log(this.registerForm.value);

      this.usuarioService.crearUsuario(this.registerForm.value).pipe(
        finalize(() => {
          this.spinerVisible=false;
          this.habilitarEmail();
        })
      ).subscribe({
        next: () => {
            alert("REGISTRADO EXITOSAMENTE");
        },
        error: (e) => {
          if (e.status === 422) {
            //UNPROCESSABLE ENTITY
            console.error("El Email ya existe. Peticion imposible de resolver", e);

            this.router.navigate(['']);

          } else if(e.status === 403) {
            //FORBBIDEN
            console.warn(e);
            alert("El email no ha sido verificado.");

            this.origenPaso();
            this.registerForm.get('email')?.setValue(this.emailVerificado);

          }else if(e.status >= 500){
            alert("ERROR del Servicio, intente mas tarde.");
            console.warn(e);

            this.router.navigate(['']);

          } else{
            alert("ERROR INESPERADO.");
            console.warn(e);
            
            this.origenPaso();

            this.router.navigate(['']);
          }
        }
      })
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
    if (this.paso() === 'email'){
      this.paso.set('pin');
      this.habilitarBtnSubmit = false;
      
      this.textoBoton = "VALIDAR PIN"

    } else if (this.paso() === 'pin'){

      this.paso.set('registrarme');
      this.habilitarBtnSubmit = false;
      
      this.textoBoton = "REGISTRARME"

      this.deshabilitarEmail();//Deshabilita el Email

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
    this.registerForm.reset;
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

