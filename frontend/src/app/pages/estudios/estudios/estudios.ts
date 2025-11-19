import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { EstudioModel } from "../../../models/estudioModels/estudioModel";
import { EstudioService } from "../../../services/estudioService/estudio-service";
import { TokenService } from "../../../auth/services/tokenService/token-service";
import { UsuarioService } from "../../../services/usuarioService/usuario-service";


@Component({
  selector: 'app-estudios',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './estudios.html',
  styleUrl: './estudios.css',
})
export class Estudios implements OnInit {

  estudios!: EstudioModel[];
  

  imagenDefecto = `${environment.imgEstudio}`;

  filtro!: FormGroup;    
  
  constructor(
    private fb: FormBuilder,
    private estudioSrvice: EstudioService,
    private tokenService: TokenService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      nombre: ['', [Validators.minLength(2)]],
    });
    this.cargarEstudios();
  }

  imagenUrl(uuidImagen?: string): string {
    if (!uuidImagen) return this.imagenDefecto;
      return `${environment.apiUrl}${uuidImagen}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return; 
    img.src = this.imagenDefecto;
  }


  cargarEstudios(): void {
    const nombre = (this.filtro.value.nombre ?? '').trim() || undefined;
    this.estudioSrvice.getFiltrarEstudios(nombre).subscribe({
      next: lista => this.estudios = lista,
      error: (e) =>{
        if(e.status === 404){
          alert("Estudios Inexistentes con esos datos");
        }else{
          alert("No se pudo cargar la lista de estudios");
        }
      } 
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset({ nombre: '' });
    this.cargarEstudios();
  }

  // Método que valida si el usuario es Arquitecto
  isArquitecto(): boolean {
    return this.tokenService.tieneRol('ROLE_ARQUITECTO');
  }

  misEstudios(): void {
    if (!this.estudios || !this.estudios.length) return;

    this.usuarioService.getUsuarioMe().subscribe({
      next: usuario => {

        const idsEstudiosUsuario = usuario.idEstudios ?? [];

        this.estudios = this.estudios.filter(e =>
          e.id != null && idsEstudiosUsuario.includes(e.id)
      );
      },
      error: (e) => {
        alert('No se pudo obtener el usuario logueado');
        console.error("No se puede leer el usuario", e);
      }
    });
  }

 
}




 






