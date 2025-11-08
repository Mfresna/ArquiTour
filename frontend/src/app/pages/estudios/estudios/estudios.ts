import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { Router, RouterLink } from '@angular/router';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { environment } from '../../../../environments/environment';

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
    private router: Router,
    private tokenService: TokenService,
    private estudioSrvice: EstudioService
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
      error: (e) => alert('No se pudo cargar la lista de estudios')
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset({ nombre: '' });
    this.cargarEstudios();
  }


}

 






