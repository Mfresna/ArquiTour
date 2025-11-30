import { Component, OnInit } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-favoritos-detalle',
  imports: [RouterLink, EsperandoModal, MensajeModal],
  templateUrl: './favoritos-detalle.html',
  styleUrl: './favoritos-detalle.css',
})
export class FavoritosDetalle implements OnInit {

  lista?: FavoritoBasicoModel;
  obras: ObraModel[] = [];
  idLista!: number;
  nombreLista: string = '';

  imagenDefecto = `${environment.imgObra}`;

   // ===== SPINNER =====
  spinerVisible = false;
  spinerMensaje = '';

  // ===== MODAL MENSAJE / CONFIRM =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';

  // Obra que se quiere eliminar (para el confirm)
  public obraPendienteEliminar: number | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
   
    this.idLista = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatosLista();
  }

    // ========== MODAL REUTILIZABLE ==========
  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info'
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
  }

  onModalAceptar(): void {
    // Si hay una obra pendiente, este "Aceptar" corresponde al confirm
    if (this.obraPendienteEliminar != null) {
      const obraId = this.obraPendienteEliminar;
      this.obraPendienteEliminar = null;
      this.modalVisible = false;

      // Ejecutamos la eliminación real
      this.eliminarObraConfirmada(obraId);
    } else {
      // Solo cerramos el modal cuando es informativo
      this.modalVisible = false;
    }
  }

  onModalCerrado(): void {
    this.modalVisible = false;
    this.obraPendienteEliminar = null;
  }

  private cargarDatosLista(): void {

    this.spinerVisible = true;
    this.spinerMensaje = 'Cargando lista de favoritos...';
    
    this.favoritosService.getFavoritosDelUsuario().subscribe({
      next: (listas: FavoritoBasicoModel[]) => {
        this.lista = listas.find(l => l.id === this.idLista);
        this.nombreLista = this.lista?.nombre ?? 'Lista sin nombre';

        this.cargarObrasDeLista();
      },
      error: () => {
        this.nombreLista = 'Lista de favoritos';
        this.cargarObrasDeLista(); 
      }
    });
  }


  cargarObrasDeLista(): void {
    this.spinerVisible = true;
    this.spinerMensaje = 'Cargando obras de esta lista...';

    this.favoritosService.getObrasDeFavorito(this.idLista).pipe(
      finalize(() => {
        this.spinerVisible = false;
        this.spinerMensaje = '';
      })
    ).subscribe({
      next: (lista: ObraModel[]) => {
        this.obras = lista;
      },
      error: () => {
        this.obras = [];
        this.mostrarModal(
          'Error al cargar obras',
          'No se pudieron cargar las obras de esta lista.',
          'error'
        );
      },
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

    // Guardamos la obra que se quiere eliminar y abrimos modal de confirmación
    this.obraPendienteEliminar = obraId;
    this.mostrarModal(
      'Quitar obra',
      '¿Estás segura/o de que querés quitar esta obra de la lista?',
      'warning'
    );
  }

  private eliminarObraConfirmada(obraId: number): void {
    this.spinerVisible = true;
    this.spinerMensaje = 'Quitando obra de la lista...';

    this.favoritosService.deleteObraDeFavorito(this.idLista, obraId).pipe(
      finalize(() => {
        this.spinerVisible = false;
        this.spinerMensaje = '';
      })
    ).subscribe({
      next: () => {
        this.obras = this.obras.filter(o => o.id !== obraId);

        this.mostrarModal(
          'Obra eliminada',
          'La obra fue quitada de la lista correctamente.',
          'success'
        );
      },
      error: () => {
        this.mostrarModal(
          'Error al quitar obra',
          'No se pudo quitar la obra de la lista.',
          'error'
        );
      }
    });
  }

}