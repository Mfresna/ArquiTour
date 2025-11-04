import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  login!: FormGroup;
  id!: string;
  editar!: boolean;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

   ngOnInit(): void {
    this.login = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  enviarFormulario(): void {
    // if (this.editar && this.id) {
    //   // Actualizar producto existente
    //   const itemActualizar = { ...this.formulario.value, id: this.id };
    //   this.service.updateProducto(itemActualizar).subscribe(() => {
    //     alert('¡Actualizado correctamente!');
    //     this.router.navigate(['/']);
    //   });
    // } else {
    //   // Crear nuevo producto
    //   this.service.postProducto(this.formulario.value).subscribe({
    //     next: () => {
    //       alert('¡Creado correctamente!');
    //       this.router.navigate(['/']);
    //     },
    //     error: (e) => console.error(e)
    //   });
    //}
  }

}