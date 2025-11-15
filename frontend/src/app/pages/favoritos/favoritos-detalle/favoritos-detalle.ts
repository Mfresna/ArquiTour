import { Component, OnInit } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';

@Component({
  selector: 'app-favoritos-detalle',
  imports: [RouterLink],
  templateUrl: './favoritos-detalle.html',
  styleUrl: './favoritos-detalle.css',
})
export class FavoritosDetalle implements OnInit {

  obras: ObraModel[] = [];
  idLista!: number;
  nombreLista: string = '';

  imagenDefecto = `${environment.imgObra}`;

  constructor(
    private route: ActivatedRoute,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
   
    this.idLista = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarObrasDeLista();
  }

  cargarObrasDeLista(): void {
    this.favoritosService.getObrasDeFavorito(this.idLista).subscribe({
      next: (lista: ObraModel[]) => this.obras = lista,
      error: () => alert('No se pudieron cargar las obras de esta lista'),
    });
  }


  imagenUrl(urls?: string[]): string {
    if (!urls || urls.length === 0) return this.imagenDefecto;
    const primera = urls[0];
    return `${environment.apiUrl}${primera}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;
    img.src = this.imagenDefecto;
  }
}