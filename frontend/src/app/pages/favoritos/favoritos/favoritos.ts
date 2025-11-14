import { Component } from '@angular/core';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';

@Component({
  selector: 'app-favoritos',
  imports: [],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {

  favoritos: FavoritoBasicoModel[] = [];
  cargando = true;

  constructor(
    private favoritoService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  private cargarFavoritos(): void {
    this.cargando = true;
    this.favoritoService.obtenerFavoritosDelUsuario().subscribe({
      next: (lista) => {
        this.favoritos = lista ?? [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // Si querés mostrar algo más específico:
        // alert('No se pudieron cargar las listas de favoritos');
      }
    });
  }

  // Si más adelante tenés ruta para crear lista:
  // irACrearLista(): void {
  //   this.router.navigate(['/favoritos/nuevo']);
  // }

}
