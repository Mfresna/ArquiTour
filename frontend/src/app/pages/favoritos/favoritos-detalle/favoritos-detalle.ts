import { Component, OnInit } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';

@Component({
  selector: 'app-favoritos-detalle',
  imports: [RouterLink],
  templateUrl: './favoritos-detalle.html',
  styleUrl: './favoritos-detalle.css',
})
export class FavoritosDetalle implements OnInit {

  lista?: FavoritoBasicoModel;
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
    this.cargarDatosLista();
  }

  private cargarDatosLista(): void {
    this.favoritosService.getFavoritosDelUsuario().subscribe({
      next: (listas: FavoritoBasicoModel[]) => {
        this.lista = listas.find(l => l.id === this.idLista);
        this.nombreLista = this.lista?.nombre ?? 'Lista sin nombre';

        this.cargarObrasDeLista();
      },
      error: () => {
        this.nombreLista = 'Lista de favoritos';
        this.cargarObrasDeLista(); // igual intento cargar obras
      }
    });
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

  eliminarObraDeLista(obraId: number, event?: Event): void {
    // Para que NO navegue al detalle de la obra al hacer clic en el botón
    event?.stopPropagation();
    event?.preventDefault();

    if (!confirm('¿Quitar esta obra de la lista?')) return;

    this.favoritosService.deleteObraDeFavorito(this.idLista, obraId).subscribe({
      next: (resp) => {
        this.obras = this.obras.filter(o => o.id !== obraId);

        if(resp.status === 204){
          alert("Se elimino favorito pq es la utlima obra")
        }

      },
      error: (e) => {
        
        if(e.status === 204){
          alert("Se elimino favorito pq es la utlima obra")
        }else{
          alert('No se pudo quitar la obra de la lista.')
        }
        
      }
    });
  } 








}