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
  mostrarBotonAceptar: boolean = true;
  mostrarBotonCancelar: boolean = false;
  textoBotonAceptar: string = 'Aceptar';
  textoBotonCancelar: string = 'Cancelar';
  cerrarAlClickFuera: boolean = true;


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


  // MÉTODO PARA MOSTRAR MODAL
  mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    opciones?: {
      mostrarCruz?: boolean;
      mostrarBotonAceptar?: boolean;
      mostrarBotonCancelar?: boolean;
      textoBotonAceptar?: string;
      textoBotonCancelar?: string;
      cerrarAlClickFuera?: boolean;
    }
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;

    this.mostrarCruz         = opciones?.mostrarCruz ?? false;
    this.mostrarBotonAceptar = opciones?.mostrarBotonAceptar ?? true;
    this.mostrarBotonCancelar = opciones?.mostrarBotonCancelar ?? false;
    this.textoBotonAceptar   = opciones?.textoBotonAceptar ?? 'Aceptar';
    this.textoBotonCancelar  = opciones?.textoBotonCancelar ?? 'Cancelar';
    this.cerrarAlClickFuera  = opciones?.cerrarAlClickFuera ?? true;
  }

// Cierre por evento "cerrado" del modal (por cruz o click fuera)
  onModalCerrado(): void {
    this.modalVisible = false;
  }

  // Click en botón ACEPTAR del modal
  onModalAceptar(): void {
    if (this.estadoCredencial === EstadoLogin.CAMBIAR_PASS) {
      // Caso especial: contraseña por defecto → ir a cambiar
      this.modalVisible = false;
      this.irACambiarPass();
    } else {
      // Otros casos: solo cerrar
      this.modalVisible = false;
    }
  }

  // Click en botón CANCELAR del modal
  onModalCancelar(): void {
    if (this.estadoCredencial === EstadoLogin.CAMBIAR_PASS) {
      // Caso especial: usuario decide seguir con la misma contraseña
      this.modalVisible = false;
      this.estadoCredencial = EstadoLogin.OK;
      this.router.navigate(['/home']);
    } else {
      this.modalVisible = false;
    }
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
              "Usted posee la contraseña por defecto, le sugerimos cambiarla por seguridad.",
              "warning",
              {
                mostrarCruz: false,
                mostrarBotonAceptar: true,
                mostrarBotonCancelar: true,
                textoBotonAceptar: "Cambiar contraseña",
                textoBotonCancelar: "Seguir sin cambiar",
                cerrarAlClickFuera: false
              }
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
          this.mostrarModal(
            "Correo enviado",
            "Le enviamos un correo para reestablecer su contraseña.",
            "success"
          );
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
    this.router.navigate(['/cambiarpass']);
  }

}