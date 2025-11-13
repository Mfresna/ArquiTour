import { Component, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';
import { CamposIguales } from '../../validadores/igualdadValidador';
import { caracteresValidador } from '../../validadores/passCaracteresValidador';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-recuperar-pass',
  standalone: true,
  imports: [ReactiveFormsModule, EsperandoModal],
  templateUrl: './cambiar-pass.html',
  styleUrl: './cambiar-pass.css',
})
export class CambiarPass implements OnInit {

  passForm!: FormGroup;
  token!: string;

  mostrarPassword = false;
  mostrarConfirmPassword = false;

  spinerVisible: boolean = false;

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
        alert ("Error en el proceso")
      }
      
    }else{
      alert("Ingrese una pass valida.");
      this.passForm.markAllAsTouched();
    }
  }

  private recuperarPass(pass: string){
    this.spinerVisible=true;  //muestro la espera

    this.authService.restaurarPass(this.token, pass).pipe(
      finalize(() => this.spinerVisible=false)
    ).subscribe({
      next: () => {
        alert('¡Contraseña actualizada correctamente!');
        this.passForm.reset;

        //Vuelve al login para loguearse
        this.router.navigate(['/login']);
      },
      error: (e) => {
        if (e.status === 401) {
          alert("El link recibido en el Email expiro, vuelva a intentarlo");
        } else {
          alert("Ocurrió un error inesperado al intentar restaurar la contraseña.");
        }
        this.passForm.reset;

        //Vuelve a auth
        this.router.navigate(['']);
      }
    })
  }

  private modificarPass(pass: string){
    this.spinerVisible=true;  //muestro la espera

    this.usuarioService.cambiarPass(pass).pipe(
      finalize(() => this.spinerVisible=false)
    ).subscribe({
      next: () => {
        alert('¡Contraseña actualizada correctamente!');

        this.router.navigate(['/home']);

      },
      error: (e) => {
        console.error(e);

        alert("Ocurrió un error inesperado al cambiar la contraseña.");

        this.passForm.reset;

        //Vuelve a home y si no estas logueado te tira afuera
        this.router.navigate(['/home']);
      }
    })
  }

}

