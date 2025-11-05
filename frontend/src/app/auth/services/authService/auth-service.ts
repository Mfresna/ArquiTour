import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../tokenService/token-service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthResponse } from '../../models/login/authResponseModel';
import { AuthRequest } from '../../models/login/authRequestModel';
import { tap } from 'rxjs';
import { LoginForm } from '../../models/login/loginFormModel';



@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly AUTH_URL = `${environment.apiUrl}/auth`;
 
  constructor(
    private http: HttpClient, 
    private tokenService: TokenService) {}

  login(formulario: LoginForm){

    //Mapeo de atributos
    let credenciales: AuthRequest = {
      username: formulario.email,
      password: formulario.password
    };

    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credenciales, {
      withCredentials: true,
    }).pipe(
      tap(res => {
        this.tokenService.set(res.accessToken);
      })
    );
  }

  // /** Ejemplo de refresh si tuvieras /auth/refresh que devuelve { accessToken } */
  // refresh(): Observable<{ accessToken: string }> {
  //   return this.http.post<{ accessToken: string }>(`${this.baseUrl}/refresh`, {}, {
  //     withCredentials: true,
  //   })
  //   .pipe(
  //     tap(res => this.tokenService.set(res.accessToken))
  //   );
  // }

  // logout(): void {
  //   this.tokenService.clear();

  //   this.http.post<{ accessToken: string }>(`${this.AUTH_URL}/logout`, {}, {
  //     withCredentials: true,
  //   })
  // }
}



///--------------------------------------------------------------------------------------------------------------------------------



// constructor(private http: HttpClient, private tokenService: TokenService) {}

//   // 🔹 Envia las credenciales y recibe el accessToken + cookie httpOnly del refresh
//   postLogin(req: AuthRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.API_URL}/login`, req, {
//       withCredentials: true  // importante para recibir la cookie del refresh
//     }).pipe(
//       tap(res => {
//         // Guarda el accessToken en memoria usando tu TokenService
//         this.tokenService.set(res.accessToken);
//       })
//     );
//   }

//   // 🔹 Pide un nuevo accessToken usando la cookie httpOnly
//   postRefresh(): Observable<{ accessToken: string }> {
//     return this.http.post<{ accessToken: string }>(`${this.API_URL}/refresh`, {}, {
//       withCredentials: true
//     }).pipe(
//       tap(res => this.tokenService.set(res.accessToken))
//     );
//   }

//   // 🔹 Borra el token de memoria (logout básico)
//   deleteSession(): void {
//     this.tokenService.clear();
//   }

























// readonly API_URL = "http://localhost:3000/productos"

// productos : Producto[]

// constructor(private http: HttpClient){
//   this.productos = []
// }

// getProductos(){
//   return this.http.get<Producto[]>(this.API_URL);
// }

// getProducto(id : string){
//   return this.http.get<Producto>(`${this.API_URL}/${id}`);
// }

// postProducto(p : Producto){
//   return this.http.post<Producto>(this.API_URL, p);
// }

// deleteProducto(id : string){
//   return this.http.delete<void>(`${this.API_URL}/${id}`);
// }

// updateProducto(p: Producto) {
//   return this.http.put<Producto>(`${this.API_URL}/${p.id}`, p);
// }




// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Location } from '@angular/common';
// import { ProductosServicio } from '../services/productos-servicio.service';

// @Component({
//   selector: 'app-producto-formulario',
//   standalone: true,
//   imports: [ReactiveFormsModule],
//   templateUrl: './producto-formulario.html',
//   styleUrls: ['./producto-formulario.css']
// })
// export class ProductoFormulario implements OnInit {

//   formulario!: FormGroup;
//   id!: string;
//   editar!: boolean;

//   constructor(
//     private location: Location,
//     private fb: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private service: ProductosServicio
//   ) {}

//   ngOnInit(): void {
//     this.id = this.route.snapshot.params['id'];

//     this.formulario = this.fb.group({
//       nombre: ['', [Validators.required, Validators.minLength(3)]],
//       precio: ['', [Validators.required, Validators.min(0)]]
//     });

//     // Verifica si hay ID para editar
//     if (this.id) {
//       this.editar = true;
//       this.service.getProducto(this.id).subscribe(item => {
//         this.formulario.patchValue(item);
//       });
//     }
//   }

//   enviarFormulario(): void {
//     if (this.editar && this.id) {
//       // Actualizar producto existente
//       const itemActualizar = { ...this.formulario.value, id: this.id };
//       this.service.updateProducto(itemActualizar).subscribe(() => {
//         alert('¡Actualizado correctamente!');
//         this.router.navigate(['/']);
//       });
//     } else {
//       // Crear nuevo producto
//       this.service.postProducto(this.formulario.value).subscribe({
//         next: () => {
//           alert('¡Creado correctamente!');
//           this.router.navigate(['/']);
//         },
//         error: (e) => console.error(e)
//       });
//     }
//   }

//   volver(): void {
//     if (this.id) {
//       this.location.back();
//     } else {
//       this.router.navigate(['/']);
//     }
//   }
// }