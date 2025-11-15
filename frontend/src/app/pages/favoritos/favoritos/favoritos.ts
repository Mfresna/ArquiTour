import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';

@Component({
  selector: 'app-favoritos-detalle',
  imports: [ReactiveFormsModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {

  
  filtro!: FormGroup;
  listas: FavoritoBasicoModel[] = [];

  cargando = false;

  constructor(
    private fb: FormBuilder,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarListas(); // carga inicial sin filtro
  }

  private inicializarFormulario(): void {
    this.filtro = this.fb.group({
      nombre: ['', [Validators.minLength(2)]]
    });
  }

  cargarListas(): void {
    this.cargando = true;

    const nombreFiltro: string = this.filtro.get('nombre')?.value?.trim() ?? '';

    this.favoritosService.getFavoritosDelUsuario().subscribe({
      next: (listas) => {
        // Si hay al menos 2 caracteres, filtro por nombre
        if (nombreFiltro && nombreFiltro.length >= 2) {
          const filtroLower = nombreFiltro.toLowerCase();
          this.listas = listas.filter(l =>
            l.nombre?.toLowerCase().includes(filtroLower)
          );
        } else {
          // Sin filtro o menos de 2 caracteres: muestro todo
          this.listas = listas;
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar listas de favoritos', err);
        this.listas = [];
        this.cargando = false;
      }
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset();
    this.cargarListas();
  }
}
