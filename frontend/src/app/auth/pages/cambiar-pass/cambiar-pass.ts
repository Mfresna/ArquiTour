import { Component, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';
import { CamposIguales } from '../../validadores/igualdadValidador';
import { caracteresValidador } from '../../validadores/passCaracteresValidador';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { finalize } from 'rxjs';
import { MensajeModal } from "../../../components/mensaje-modal/mensaje-modal";


@Component({
  selector: 'app-recuperar-pass',
  standalone: true,
  imports: [ReactiveFormsModule, EsperandoModal, MensajeModal],
  templateUrl: './cambiar-pass.html',
  styleUrl: './cambiar-pass.css',
})
export class CambiarPass implements OnInit {

  passForm!: FormGroup;
  token!: string;

  mostrarPassword = false;
  mostrarConfirmPassword = false;

  spinerVisible: boolean = false;

  //MODAL
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  redirigirADestino: 'login' | 'inicio' | 'home' | null = null;
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];

    this.passForm = this.fb.group(
      {
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
      ]},
      {validators: CamposIguales('nuevaPass', 'confirmaPass')}
    );

  }
  //METODOS PARA EL MODAL

private mostrarModal(titulo: string, mensaje: string, destino: 'login' | 'inicio' | 'home' | null = null,
  tipo: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  this.modalTitulo = titulo;
  this.modalMensaje = mensaje;
  this.modalVisible = true;
  this.redirigirADestino = destino;
  this.modalTipo = tipo;
}

  // Botón aceptar del modal
  onModalAceptar() {
    this.modalVisible = false;

    if (this.redirigirADestino === 'login') {
      this.router.navigate(['/login']);
    } else if (this.redirigirADestino === 'home') {
      this.router.navigate(['/home']);
    } else if (this.redirigirADestino === 'inicio') {
      this.router.navigate(['']);
    }

    this.redirigirADestino = null;
  }


  onModalCerrado() {
    this.modalVisible = false;
    this.redirigirADestino = null;
  }
  /*==============================================*/

  enviarFormulario(): void { 
    const pass = this.passForm.get('nuevaPass')?.value
    
    if(this.passForm.valid){
      
      if (this.token && pass) {
        //RECUPERAR LA CONTRASEÑA
        this.recuperarPass(pass);

      }else if (pass){
        //MODIFICAR CONTRASEÑA CON SESION
        this.modificarPass(pass);

      }else{
        console.warn("Error en el proces de cambio de contraseña");
        this.mostrarModal(
          "Error en el proceso",
          "Ocurrió un error en el proceso de cambio de contraseña.",
          null,
          "error"
        );
      }
      
    }else{
      this.mostrarModal("Datos inválidos", 
        "Ingrese una contraseña válida.",
        null,
        "warning");

      this.passForm.markAllAsTouched();
    }
  }

  private recuperarPass(pass: string){
    this.spinerVisible=true;  //muestro la espera

    this.authService.restaurarPass(this.token, pass).pipe(
      finalize(() => {
        this.spinerVisible=false;
        this.authService.logout();
      })
    ).subscribe({
      next: () => {
        this.mostrarModal(
          "Contraseña actualizada",
          "¡Contraseña actualizada correctamente!",
          "login",
          "success"
        );

        this.passForm.reset();

      },
      error: (e) => {
        if (e.status === 401) {
          this.mostrarModal(
            "Link expirado",
            "El link recibido en el email expiró. Vuelva a intentarlo.",
            "inicio",
            "warning"
          );
        } else {
          this.mostrarModal(
            "Error inesperado",
            "Ocurrió un error al intentar restaurar la contraseña.",
            "inicio",
            "error"
          );
        }
        this.passForm.reset();

      }
    })
  }

  private modificarPass(pass: string){
    this.spinerVisible=true;  //muestro la espera

    this.usuarioService.cambiarPass(pass).pipe(
      finalize(() => {
        this.spinerVisible=false;
        this.authService.logout();
      })
    ).subscribe({
      next: () => {
        this.mostrarModal(
          "Contraseña actualizada",
          "¡Contraseña actualizada correctamente!",
          "login",
          "success"
        );

      },
      error: (e) => {
        console.error(e);

        this.mostrarModal(
          "Error inesperado",
          "Ocurrió un error al cambiar la contraseña.",
          "home",
          "error"
        );

        this.passForm.reset();
      }
    })
  }

}

