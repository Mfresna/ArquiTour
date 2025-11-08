import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { MensajeModal } from '../../../components/mensaje-modal/mensaje-modal';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,EsperandoModal,MensajeModal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  login!: FormGroup;
  enviandoPin!: boolean;
  credInvalidas: boolean = false;

  mostrarPassword = false;

  modalVisible!: boolean;
  modalTitulo!: string;
  modalMensaje!: string;

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

  loguearse(): void {
    if (this.login.invalid) {
      this.login.markAllAsTouched();
    }else{
      this.authService.login(this.login.value).subscribe({
        next: (res) => {
          if (res.cambiarPass) {

            //Parametros del Modal
            this.modalVisible=true;
            this.modalTitulo="CONTRASEÑA POR DEFECTO"
            this.modalMensaje="Usted posee la contraseña por defecto, debe cambiarla por seguridad"
            
            this.router.navigate(['/cambiar-pass']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (e) => {
          if(e.status === 401 || e.status === 403){
            this.credInvalidas = true;
            alert('Credenciales inválidas');
          }else if (e.status >= 500) {
            alert('Error interno del servidor. Intente nuevamente más tarde.');
          }else if (e.status === 0) {
            // Error de red o servidor caído
            alert('No se pudo conectar con el servidor. Verifique su conexión.');
          }else{
            alert('Ocurrió un error inesperado.');
          }
        }
      });
    }
  }

  recuperarPass():void{
    const emailValidacion = this.login.get('email');  //Control de Validacion de email

    if (emailValidacion != null && emailValidacion.invalid) {
      alert("Ingrese un correo valido a recuperar");
      emailValidacion.markAsTouched();
    }else{
      let email = this.login.get('email')?.value.trim().toLowerCase();

      this.enviandoPin = true;

      this.authService.enviarRecuperarPass(email).subscribe({
        next: (res) => {
          this.enviandoPin = false
        },
        error: (e) => {
          this.enviandoPin = false;

          if (e.status === 400) {
            alert('Email inválido.');
          } else {
            alert('Ocurrió un error. Intentá más tarde.')
          }
        }
      });
    }

  }

  volver(): void {
    //Emite que se apreto el boton, sirve en el authPage para saber que mostrar
    this.volverEmit.emit();
  }

}