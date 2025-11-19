import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { finalize } from 'rxjs/operators';
import { EstadoLogin } from '../../models/login/EstadoLoginEnum';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,EsperandoModal,MensajeModal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  login!: FormGroup;
  enviandoPin!: boolean;

  estadoCredencial!: EstadoLogin;
  estadosLogin = EstadoLogin;

  mostrarPassword = false;

  // ========= MODAL =========
  modalVisible: boolean = false;
  modalTitulo: string = '';
  modalMensaje: string = '';
  modalTipo: MessageType = 'info'; 
  mostrarCruz: boolean = false;
  private cierrePorAceptar: boolean = false;


  //EMITERS
  @Output() volverEmit = new EventEmitter<void>();


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.login = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }


  // MÉTODO SIMPLE PARA MOSTRAR MODAL
  mostrarModal(titulo: string, mensaje: string, tipo: MessageType = 'info', mostrarCruz: boolean = false 
  ): void {
  this.modalTitulo = titulo;
  this.modalMensaje = mensaje;
  this.modalTipo = tipo;
  this.modalVisible = true;
  this.mostrarCruz = mostrarCruz;
  }

onModalCerrado(): void {
  this.modalVisible = false;

  if (this.cierrePorAceptar) {
    this.cierrePorAceptar = false;
    this.mostrarCruz = false;
    return;              
  }
  if (this.mostrarCruz && this.estadoCredencial === EstadoLogin.CAMBIAR_PASS) {
    this.mostrarCruz = false;
    this.router.navigate(['/home']);
    return;
  }
  this.mostrarCruz = false;
}

  loguearse(): void {
    if (this.login.invalid) {
      this.login.markAllAsTouched();
    }else{
      this.authService.login(this.login.value).subscribe({
        next: (res) => {
          if (res.cambiarPass) {
            this.estadoCredencial = EstadoLogin.CAMBIAR_PASS;

            this.mostrarModal(
              "CONTRASEÑA POR DEFECTO",
              "Usted posee la contraseña por defecto, debe cambiarla por seguridad.",
              "warning",
              true
            );  
                      
          } else {
            this.estadoCredencial = EstadoLogin.OK;
            this.router.navigate(['/home']);
          }
        },
        error: (e) => {
          if(e.status === 401 || e.status === 403){
            this.estadoCredencial = EstadoLogin.CREDENCIALES_INVALIDAS;

          }else if(e.status === 423){
            this.estadoCredencial = EstadoLogin.CUENTA_INACTIVA;
            
          }else if (e.status >= 500) {
            this.mostrarModal("Error del servidor", 
              "Intente nuevamente más tarde.",
              "error");
          }else if (e.status === 0) {
            // Error de red o servidor caído
            this.mostrarModal("Sin conexión", 
              "No se pudo conectar al servidor.",
              "error");
          }else{
            this.mostrarModal("Error inesperado", 
              "Ocurrió un error inesperado.",
              "error");
          }
        }
      });
    }
  }

  recuperarPass():void{
    const emailValidacion = this.login.get('email');  //Control de Validacion de email

    if (emailValidacion != null && emailValidacion.invalid) {
      this.mostrarModal(
        "Email inválido",
        "Ingrese un correo válido para recuperar su contraseña.",
        "warning"
      );
      emailValidacion.markAsTouched();
    }else{
      let email = this.login.get('email')?.value.trim().toLowerCase();

      this.enviandoPin = true;

      this.authService.enviarRecuperarPass(email).pipe(
        //Se finaliza siempre con error o sin error en el suscribe
        finalize(() => this.enviandoPin = false) 
      ).subscribe({
        next: (res) => {
          alert("Le enviamos un correo para reestablecer su contraseña");
        },  
        error: (e) => {
          if (e.status >= 400 || e.status <= 499) {
             this.mostrarModal(
            "Error al enviar correo",
            "No se pudo enviar el correo de recuperación. Verifique el email ingresado.",
            "error"
          );
            console.error("Error en el envio del correo de recuperacion a: " + email);
          } else {
             this.mostrarModal(
            "Error inesperado",
            "Ocurrió un error inesperado. Intente nuevamente más tarde.",
            "error"
             ),
            console.error("Ocurrio un error inesperado");
          }
        }
      })
    }

  }

  volver(): void {
    //Emite que se apreto el boton, sirve en el authPage para saber que mostrar
    this.volverEmit.emit();
  }

  irACambiarPass(): void {
    this.cierrePorAceptar = true;
    this.router.navigate(['/cambiarpass']);
  }

}