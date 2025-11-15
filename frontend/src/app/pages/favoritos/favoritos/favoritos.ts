import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favoritos-detalle',
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {

  
  filtro!: FormGroup;
  listas: (FavoritoBasicoModel & { cantidadObras: number })[] = [];
  editandoId: number | null = null;
  controlEdicion = new FormControl('', [Validators.required, Validators.minLength(2)]);
  nuevoNombre: string = '';

  cargando = false;

  constructor(
    private fb: FormBuilder,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarListas(); 
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

        // Filtro por nombre
        let filtradas = listas;
        if (nombreFiltro && nombreFiltro.length >= 2) {
          const contenidoFiltro = nombreFiltro.toLowerCase();
          filtradas = listas.filter(l =>
            l.nombre?.toLowerCase().includes(contenidoFiltro)
          );
        }

      // Primero muestro la lista sin cantidades
      this.listas = filtradas.map(l => ({
        ...l,
        cantidadObras: 0 // temporal
      }));

      // Luego cargo la cantidad de obras para cada lista
      this.listas.forEach(lista => {
        this.favoritosService.getObrasDeFavorito(lista.id).subscribe({
          next: (obras) => lista.cantidadObras = obras.length
        });
      });

      this.cargando = false;
    },
      error: (err) => {
        console.error('Error al cargar listas', err);
        this.listas = [];
        this.cargando = false;
      }
    });
  }


  limpiarFiltro(): void {
    this.filtro.reset();
    this.cargarListas();
  }

  eliminarLista(id: number): void {
    if (!confirm('¿Eliminar esta lista de favoritos?')) return;

    this.favoritosService.deleteFavorito(id).subscribe({
      next: () => {
        this.listas = this.listas.filter(l => l.id !== id);
        alert('Lista eliminada correctamente.');
      },
      error: () => {
        alert('No se pudo eliminar la lista.');
      }
    });
  }



  activarEdicion(lista: FavoritoBasicoModel): void {
    this.editandoId = lista.id;
    this.controlEdicion.setValue(lista.nombre); 
  }

  cancelarEdicion(): void {
    this.editandoId = null;
     this.controlEdicion.reset();
  }

  guardarEdicion(id: number): void {
    if (this.controlEdicion.invalid) {
      this.controlEdicion.markAsTouched();
      return;
    }

    const nuevoNombre = this.controlEdicion.value!.trim();

    this.favoritosService.renombrarFavorito(id, nuevoNombre)
      .subscribe({
        next: (actualizado) => {
          // Actualizar localmente
          const i = this.listas.findIndex(l => l.id === id);
          if (i !== -1) {
            this.listas[i].nombre = actualizado.nombreLista;
          }

          this.cancelarEdicion();
        },
        error: () => alert('No se pudo renombrar la lista.')
      });
  }

 




}
