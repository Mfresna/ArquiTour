import { Component, ElementRef, ViewChild } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraService } from '../../../services/obraService/obra-service';
import { CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';
import { SelectFavorito } from '../../../components/select-favorito/select-favorito';
import { FavoritosService } from '../../../services/favoritosService/favoritos-service';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { finalize } from 'rxjs';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { MapaObra } from "../../../components/mapa-obra/mapa-obra";

@Component({
  selector: 'app-obra-detalle',
  imports: [RouterLink, SelectFavorito, EsperandoModal, MensajeModal, MapaObra],
  templateUrl: './obra-detalle.html',
  styleUrl: './obra-detalle.css',
})
export class ObraDetalle {

  obra?: ObraModel;
  cargando = true;

  //Estado Favoritos
  mostrarSelectorFavoritos = false;
  estaEnFavoritos = false;

  imagenDefecto = `${environment.imgObra}`;
  nombreEstudio?: string;

  // Galería
  selectIndex = 0;

  //Carrusel miniaturas
  @ViewChild('carruselImagenes') carruselImagenes!: ElementRef;


  //Para mostrar el nombre prolijo de estado y categoria
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion = EstadoObraDescripcion;

  //Ventana de imagen
  ventanaAbierta = false;

  spinerVisible: boolean = false;

  // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';

  mostrarCruz = false;
  mostrarBotonAceptar = true;
  mostrarBotonCancelar = false;
  textoBotonAceptar = 'Aceptar';
  textoBotonCancelar = 'Cancelar';
  cerrarAlClickFuera = true;

  esConfirmacionEliminacion = false;

  redirigirAObras = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraSrvice: ObraService,
    private tokenSrvice: TokenService,
    private estudioSrvice: EstudioService,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { 
      this.router.navigate(['/obras']); 
      return; 
    }

    this.spinerVisible = true;

    this.obraSrvice.getObra(id).pipe(
      finalize(() => this.spinerVisible = false)
    ).subscribe({
      next: (data) => {
        this.obra = data;
        this.cargando = false;

        if (data.estudioId) {
          this.nombreEstudio = this.estudioSrvice.getNombreById(data.estudioId);

          if (!this.nombreEstudio) {
            this.estudioSrvice.getEstudio(data.estudioId).subscribe({
              next: est => {
                this.nombreEstudio = est.nombre;
                this.estudioSrvice.cachearNombre(est.id!, est.nombre);
              },
              error: (e) =>{
                console.error(e);

                this.nombreEstudio = 'Estudio desconocido';
                
                if(e.status === 404){
                  alert("estudio no encontrado");
                }else if(e.status >= 500){
                    this.mostrarModal(
                    'Error del servidor',
                    'Ocurrió un error al cargar el estudio asociado.',
                    'error'
                  );
                }else{
                   this.mostrarModal(
                    'Error inesperado',
                    'No se pudo cargar la información del estudio asociado.',
                    'error'
                  );
                }
    
              } 
            });
          }
        }
      },
      error: (e) => {
        console.error(e);

        if (e.status === 404) {
          this.mostrarModal(
            'Obra no encontrada',
            'La obra solicitada no existe o fue eliminada.',
            'warning',
            { redirigirAObras: true }
          );
        } else if (e.status >= 500) {
          this.mostrarModal(
            'Error del servidor',
            'Ocurrió un error al cargar la obra. Intente nuevamente más tarde.',
            'error',
            { redirigirAObras: true }
          );
        } else {
          this.mostrarModal(
            'Error inesperado',
            'No se pudo cargar la obra.',
            'error',
          );
        }
      },
    });

    this.verificarSiEstaEnFavoritos(id);
  }

  // ============= MODAL =============

  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    opciones?: {
      redirigirAObras?: boolean;
      mostrarCruz?: boolean;
      mostrarBotonAceptar?: boolean;
      mostrarBotonCancelar?: boolean;
      textoBotonAceptar?: string;
      textoBotonCancelar?: string;
      cerrarAlClickFuera?: boolean;
    }
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;

    const {
      redirigirAObras = false,
      mostrarCruz = false,
      mostrarBotonAceptar = true,
      mostrarBotonCancelar = false,
      textoBotonAceptar = 'Aceptar',
      textoBotonCancelar = 'Cancelar',
      cerrarAlClickFuera = true,
    } = opciones || {};

    this.redirigirAObras = redirigirAObras;
    this.mostrarCruz = mostrarCruz;
    this.mostrarBotonAceptar = mostrarBotonAceptar;
    this.mostrarBotonCancelar = mostrarBotonCancelar;
    this.textoBotonAceptar = textoBotonAceptar;
    this.textoBotonCancelar = textoBotonCancelar;
    this.cerrarAlClickFuera = cerrarAlClickFuera;
  }

  onModalAceptar(): void {
    if (this.esConfirmacionEliminacion) {
   
      this.esConfirmacionEliminacion = false;
      this.modalVisible = false;
      this.eliminarObra();  
      return;
    }

    this.modalVisible = false;

    if (this.redirigirAObras) {
      this.redirigirAObras = false;
      this.router.navigate(['/obras']);
    }
  }

  onModalCancelar(): void {
    this.esConfirmacionEliminacion = false;
    this.modalVisible = false;
  }

  onModalCerrado(): void {
    this.esConfirmacionEliminacion = false;
    this.modalVisible = false;
  }
  

  // ================== FAVORITOS: CORAZÓN + POPUP ==================

  private verificarSiEstaEnFavoritos(idObra: number): void {
    this.favoritosService.getFavoritosDelUsuario().subscribe({
      next: (listas) => {
        // Busco en cada lista si está la obra
        let encontrada = false;

        const consultas = listas.map(lista =>
          this.favoritosService.getObrasDeFavorito(lista.id).subscribe({
            next: (obras) => {
              if (obras.some(o => o.id === idObra)) {
                encontrada = true;
                this.estaEnFavoritos = true; 
              }
            }
          })
        );
      },
      error: () => {
        console.warn('No se pudieron verificar los favoritos.');
      }
    });
  }


  /** Recibe del hijo si la obra pertenece a alguna lista */
  onEstadoFavoritoCambio(esta: boolean): void {
    this.estaEnFavoritos = esta;
  }
  
  /** Muestra u oculta el popup que contiene las listas de favoritos */
  mostrarOcultarSelectorFavoritos(event?: MouseEvent): void {
    event?.stopPropagation();
    this.mostrarSelectorFavoritos = !this.mostrarSelectorFavoritos;
    if (this.mostrarSelectorFavoritos) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  /** Se ejecuta cuando el componente hijo avisa que se cerró */
  onCerradoSelector(): void {
    this.mostrarSelectorFavoritos = false;
    document.body.classList.remove('no-scroll');
  }

  

  // Imágenes

  imgSrc(): string[] {
    const urls = this.obra?.urlsImagenes ?? [];
    if (!urls.length) return [this.imagenDefecto];

    return urls.map(u => {
     const path = u.startsWith('/') ? u : `/${u}`;
      return `${environment.apiUrl}${path}`;
    });
  }

  /** Imagen principal según el índice seleccionado. */
  imagenPrincipal(): string {
    const imgs = this.imgSrc();
    return imgs[Math.min(this.selectIndex, imgs.length - 1)];
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return; 
    img.src = this.imagenDefecto;
  }
    
  // --------- Interacción de la galería ----------
  seleccionarImg(index: number): void {
    this.selectIndex = index;
  }

  mover(paso: number): void {
    const n = this.imgSrc().length;
    if (n <= 1) return;

    this.selectIndex = (this.selectIndex + paso + n) % n;
  }

  scrollCarrusel(direccion: number) {
    const contenedor = this.carruselImagenes.nativeElement;
    const scrollAmount = 260; // ancho de imagen (240) + gap (10) + margen (10)
    contenedor.scrollLeft += scrollAmount * direccion;
  }
    
  // --- Ventana (imagen en grande) ---

  abrirVentana(i: number): void {
    this.selectIndex = i;
    this.ventanaAbierta = true;
  }

  cerrarVentana(): void {
    this.ventanaAbierta = false;
  }


  // Roles y acciones

  puedeGestionar(): boolean {
    return this.tokenSrvice.isAdmin() || this.tokenSrvice.isArquitecto();
  }

  editar(): void {
    if (!this.obra?.id) return;
    this.router.navigate(['/obras', this.obra.id, 'editar']);
  }

  eliminar(): void {
    if (!this.obra?.id) return;

    this.esConfirmacionEliminacion = true;

    this.mostrarModal(
      'Confirmar eliminación',
      '¿Seguro que deseas eliminar esta obra? Esta acción no se puede deshacer.',
      'warning',
      {
        mostrarCruz: false,
        mostrarBotonAceptar: true,
        mostrarBotonCancelar: true,
        textoBotonAceptar: 'Eliminar',
        textoBotonCancelar: 'Cancelar',
        cerrarAlClickFuera: false,
      }
    );
  }

  // Acción real de borrado
  private eliminarObra(): void {
    if (!this.obra?.id) return;

    this.spinerVisible = true;
    
    this.obraSrvice.deleteObra(this.obra.id).pipe(
      finalize(() => this.spinerVisible = false)
    ).subscribe({
      next: () => {
        this.mostrarModal(
          'Obra eliminada',
          'La obra fue eliminada correctamente.',
          'success',
          {
            redirigirAObras: true,
            mostrarCruz: false,
            mostrarBotonAceptar: true,
            mostrarBotonCancelar: false,
            cerrarAlClickFuera: false,
          }
        );
      },
      error: (e) =>{
        if(e.status === 404){
          this.mostrarModal(
            'Obra no encontrada',
            'La obra ya no existe.',
            'warning',
            { redirigirAObras: true }
          );
        }else if(e.status === 401){
          this.mostrarModal(
            'Sin permisos',
            'Un arquitecto no puede eliminar obras que no pertenecen a sus estudios.',
            'error'
          ); 
        }else{
          this.mostrarModal(
            'Error al eliminar',
            'No se pudo eliminar la obra.',
            'error'
          );
        }
      } 
    });
  }

  hacerScroll(elemento: HTMLElement) {
    elemento.scrollIntoView({
      behavior: 'smooth',
      block: 'start'   // coloca el elemento en top:0
    });
  }

}
