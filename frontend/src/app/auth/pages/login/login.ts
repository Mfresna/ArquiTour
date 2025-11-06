import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  login!: FormGroup;

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
            alert("Ingreso debe cambiar la pass")
            //this.router.navigate(['/cambiar-password']);
          } else {
            alert("ingreso no debe cambiar la pass")
            //this.router.navigate(['/']);
          }
        },
        error: (e) => {
          alert('Credenciales inválidas');
        }
        //complete: () => this.cargando = false
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

      this.authService.enviarRecuperarPass(email).subscribe({
        next: (res) => {
          alert("MAIL ENVIADO - Siga los Pasos");
        },
        error: (e) => {
          if (e.status === 400) {
            alert('Email inválido.');
          } else {
            alert('Ocurrió un error. Intentá más tarde.')
          }
        }
      });
    }

  }

  mostrarPassword = false;

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }


}