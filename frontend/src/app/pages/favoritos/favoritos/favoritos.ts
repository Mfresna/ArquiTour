import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { FavoritoBasicoModel } from '../../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';
import { RouterLink } from '@angular/router';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink,ReactiveFormsModule, EsperandoModal, MensajeModal],
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

   // ===== SPINNER =====
  spinerVisible = false;
  spinerMensaje = '';

  // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';

  mostrarCruz = true;
  mostrarBotonAceptar = true;
  mostrarBotonCancelar = false;
  textoBotonAceptar = 'Aceptar';
  textoBotonCancelar = 'Cancelar';
  cerrarAlClickFuera = true;

  // modo del modal: mensaje normal o confirmación de eliminar
  modalModo: 'normal' | 'confirmEliminar' = 'normal';
  listaIdPendiente?: number;

  constructor(
    private fb: FormBuilder,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarListas(); 
  }

  // ========== MODAL REUTILIZABLE ========

   private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info'
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;

    this.modalModo = 'normal';
    this.listaIdPendiente = undefined;

    this.mostrarCruz = true;
    this.mostrarBotonAceptar = true;
    this.mostrarBotonCancelar = false;
    this.textoBotonAceptar = 'Aceptar';
    this.textoBotonCancelar = 'Cancelar';
    this.cerrarAlClickFuera = true;

    this.modalVisible = true;
  }


  onModalAceptar(): void {
    if (this.modalModo === 'confirmEliminar') {
      const id = this.listaIdPendiente;
      this.modalVisible = false;
      this.modalModo = 'normal';
      this.listaIdPendiente = undefined;

      if (id != null) {
        this.ejecutarEliminarLista(id);
      }
      return;
    }

    // modo normal: solo cerrar
    this.modalVisible = false;
  }

  onModalCancelar(): void {
    // cancelar confirmación
    this.modalVisible = false;
    this.modalModo = 'normal';
    this.listaIdPendiente = undefined;
  }

  onModalCerrado(): void {
    // cerrar por X o click fuera
    this.modalVisible = false;
    this.modalModo = 'normal';
    this.listaIdPendiente = undefined;
  }


  private inicializarFormulario(): void {
    this.filtro = this.fb.group({
      nombre: ['', [Validators.minLength(2)]]
    });
  }

  cargarListas(): void {
    this.spinerVisible = true;
    this.spinerMensaje = 'Cargando listas de favoritos...';
    this.cargando = true;

    const nombreFiltro: string = this.filtro.get('nombre')?.value?.trim() ?? '';

    this.favoritosService.getFavoritosDelUsuario().pipe(
      finalize(()=> {
        this.spinerVisible = false;
        this.spinerMensaje = '';
        this.cargando = false;
      })
    ).subscribe({
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
      error: (e) => {
        console.error('Error al cargar listas', e);

        if(e.status === 404){
         this.mostrarModal(
            'Sin listas',
            'No se encontraron listas de favoritos.',
            'info'
          );
        }else{
           this.mostrarModal(
            'Error al cargar listas',
            'No se pudieron cargar tus listas de favoritos.',
            'error'
          );
        }

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
    this.mostrarConfirmEliminar(id);
  }

  /** Lógica real de eliminación (antes estaba dentro de eliminarLista) */
  private ejecutarEliminarLista(id: number): void {
    this.spinerVisible = true;
    this.spinerMensaje = 'Eliminando lista...';

    this.favoritosService.deleteFavorito(id).pipe(
      finalize(()=> {
        this.spinerVisible = false;
        this.spinerMensaje = '';
      })
    ).subscribe({
      next: () => {
        this.listas = this.listas.filter(l => l.id !== id);
        this.mostrarModal(
          'Lista eliminada',
          'La lista fue eliminada correctamente.',
          'success'
        );
      },
      error: () => {
        this.mostrarModal(
          'Error al eliminar',
          'No se pudo eliminar la lista.',
          'error'
        );
      }
    });
  }

/** Modal especial de confirmación para eliminar una lista */
private mostrarConfirmEliminar(idLista: number): void {
  this.modalTitulo = 'Eliminar lista';
  this.modalMensaje = '¿Seguro que deseas eliminar esta lista de favoritos? Esta acción no se puede deshacer.';
  this.modalTipo = 'warning';

  this.modalModo = 'confirmEliminar';
  this.listaIdPendiente = idLista;

  this.mostrarCruz = false;
  this.mostrarBotonAceptar = true;
  this.mostrarBotonCancelar = true;
  this.textoBotonAceptar = 'Eliminar';
  this.textoBotonCancelar = 'Cancelar';
  this.cerrarAlClickFuera = false;

  this.modalVisible = true;
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

          this.spinerVisible = false;
          this.mostrarModal(
            'Nombre actualizado',
            'La lista se renombró correctamente',
            'success'
          );
        },
        error: (e) =>{
          console.error(e);

          if(e.status === 409){
             this.mostrarModal(
              'Nombre repetido',
              'Ya existe una lista con ese nombre.',
              'warning'
            );
          }else{
            this.mostrarModal(
              'Error al renombrar',
              'No se pudo completar la acción.',
              'error'
            );
          }

        } 
      });
  }

 




}
