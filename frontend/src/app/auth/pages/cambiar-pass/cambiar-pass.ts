import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../services/authService/auth-service';

@Component({
  selector: 'app-recuperar-pass',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-pass.html',
  styleUrl: './cambiar-pass.css',
})
export class CambiarPass implements OnInit {

  passForm!: FormGroup;
  token!: string;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];

    this.passForm = this.fb.group({
      nuevaPass: ['', [Validators.required, Validators.minLength(3)]],
      confirmaPass: ['', [Validators.required, Validators.min(0)]]
    });

  }

  enviarFormulario(): void { 
    const pass = this.passForm.get('nuevaPass')?.value

    if(this.passForm.valid){
      //Si hay token y hay pass
      if (this.token && pass) {
        this.authService.restaurarPass(this.token, pass).subscribe({
          next: () => {
            alert('¡Contraseña actualizada correctamente!');
            this.passForm.reset;

            this.router.navigate(['/']);  //deberia volver al login
          },
          error: (e) => {
            if (e.status === 401) {
              alert("El link recibido en el Email expiro, vuelva a intentarlo");
            } else {
              alert("Ocurrió un error inesperado al intentar restaurar la contraseña.");
            }
            
            this.passForm.reset;
          }
        })
      }else{
        alert ("Error en el token recibido por mail. Reintente")
      }
      
    }else{
      alert("Ingrese una pass valida.");
      this.passForm.markAllAsTouched();
    }
  }
}
