import {Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { PinVerificador } from '../../components/pin/pin-verificador';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { PinService } from '../../services/pinService/pin-service';
import { finalize } from 'rxjs/operators';


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

  private enviarPin(){

      this.siguientePaso();//BORRAR



    // this.spinerVisible=true;  //muestro la espera
    // this.spinerMensaje="Enviando PIN al Email..."

    // this.pinService.enviarPin(this.registerForm.get('email')?.value).pipe(
    //   finalize(() => this.spinerVisible=false)
    // ).subscribe({
    //   next: () => {
    //     this.siguientePaso();
    //   },
    //   error: (e) => {
    //     if (e.status === 409) {
    //       alert("El mail ya se encuentra registrado en la base de datos.");
    //       this.router.navigate(['/login']);
    //       console.warn(e);

    //     } else if(e.status === 423) {
    //       alert("Aguarde para enviar un nuevo PIN.");
    //       console.warn(e);

    //     }else if(e.status >= 500){
    //       alert("ERROR del Servicio, intente mas tarde.");
    //       console.warn(e);

    //     } else{
    //       alert("ERROR INESPERADO.");
    //       console.warn(e);
    //     }
    //   }
    // })
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

  }

  private subIniciales(){
    
    //Se suscribe a los cambios de estado de los Input que marcan 
    // un cambio de estado en el btnPrincipal

    //Elemento de control
    const emailControl = this.registerForm.get('email')
    const pinControl = this.registerForm.get('pin');

    emailControl?.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        //Solo cuando el mail sea valido se habilita el boton
        this.habilitarBtnSubmit = true;
      }else{
        this.habilitarBtnSubmit = false;
      }
    });

    pinControl?.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        //Solo cuando el mail sea valido se habilita el boton
        this.habilitarBtnSubmit = true;
      }else{
        this.habilitarBtnSubmit = false;
      }
    });
  
  }

  //Signal de pasos
  siguientePaso() {
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

    } else if (this.paso() === 'registrarme'){
      this.paso.set('pin');
      this.habilitarBtnSubmit = false;

      this.textoBoton = "VALIDAR PIN"

    } 
  }

  //RECIBE PIN DEL COMPONENTE
  reciboPinCompleto(pin: string) {
    this.registerForm.get('pin')?.setValue(pin);
    console.log('PIN recibido:', pin);
  }

  recibioPinIncompleto(){
    this.registerForm.get('pin')?.setValue('');
  }

}

