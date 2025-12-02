import { Component } from '@angular/core';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { forkJoin, tap } from 'rxjs';
import { ObraService } from '../../../services/obraService/obra-service';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';

@Component({
  selector: 'app-estudio-detalle',
  imports: [RouterLink, MensajeModal],
  templateUrl: './estudio-detalle.html',
  styleUrl: './estudio-detalle.css',
})
export class EstudioDetalle {
  estudio?: EstudioModel;
  cargando = true;

  obrasVinculadas: { id: number; nombre: string }[] = [];

  arquitectosVinculados: { id: number; nombre: string }[] = [];

  imagenDefecto = `${environment.imgEstudio}`;


  private idsEstudiosUsuario: number[] = [];

  
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


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudioService: EstudioService,
    private usuarioService: UsuarioService,
    private obraService: ObraService,
    private tokenSrv: TokenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Cargar Estudio
    this.estudioService.getEstudio(id).subscribe({
      next: (est: EstudioModel) => {
        this.estudio = est;
        this.cargando = false;

        // Obras Vinculadas
        const ids = est.obrasIds ?? [];
        this.cargarObrasVinculadasPorIds(ids);

        // Arquitectos vinculados
        const idsArquitectos = est.arquitectosIds ?? [];
        this.cargarArquitectosVinculadosPorIds(idsArquitectos);
      },
      error: (e) => {
        console.error(e);

        if(e.status === 404){
          this.mostrarModal(
            "Estudio no encontrado",
            "El estudio solicitado no existe.",
            "warning"
          );
        }else if(e.status >= 500){
          this.mostrarModal(
            "Error del servidor",
            "Ocurrió un error al cargar el estudio.",
            "error"
          );
        }else{
          this.mostrarModal(
            "Error inesperado",
            "No se pudo cargar el estudio.",
            "error"
          );
        } 
      }
    });

    // 2) Cargar usuario logueado (para saber sus estudios)
    this.usuarioService.getUsuarioMe().subscribe({
      next: usuario => {
        this.idsEstudiosUsuario = usuario.idEstudios ?? [];
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
        this.mostrarModal(
          "Error:",
          "No se pudieron cargar los datos del sus estudios.",
          "warning"
        );
        this.idsEstudiosUsuario = [];
      }
    });
  }


  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    opciones?: {
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
      mostrarCruz = false,
      mostrarBotonAceptar = true,
      mostrarBotonCancelar = false,
      textoBotonAceptar = 'Aceptar',
      textoBotonCancelar = 'Cancelar',
      cerrarAlClickFuera = true,
    } = opciones || {};

    this.mostrarCruz = mostrarCruz;
    this.mostrarBotonAceptar = mostrarBotonAceptar;
    this.mostrarBotonCancelar = mostrarBotonCancelar;
    this.textoBotonAceptar = textoBotonAceptar;
    this.textoBotonCancelar = textoBotonCancelar;
    this.cerrarAlClickFuera = cerrarAlClickFuera;
  }
  
  onModalAceptar(): void {
    if (this.esConfirmacionEliminacion) {
      // confirmar eliminación
      this.esConfirmacionEliminacion = false;
      this.modalVisible = false;
      this.eliminarEstudio();   
      return;
    }


    this.modalVisible = false;

    this.router.navigate(['/estudios']);
  }

  // Click en botón CANCELAR
  onModalCancelar(): void {
    this.esConfirmacionEliminacion = false;
    this.modalVisible = false;
  }


  onModalCerrado(): void {
    this.modalVisible = false;
  }


  confirmarEliminacion(): void {
    if (!this.estudio?.id) return;

    this.esConfirmacionEliminacion = true;
    this.mostrarModal(
      'Confirmar Eliminación',
      '¿Seguro que deseas eliminar este estudio? Esta acción no se puede deshacer.',
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

  
  //======OBRAS===================
  private cargarObrasVinculadasPorIds(ids: number[]): void {
    if (!ids?.length) {
      this.obrasVinculadas = [];
      return;
    }

    // Nombre de Obras
    const faltantes: number[] = [];
    this.obrasVinculadas = ids.map(id => {
      const nombre = this.obraService.getNombreById(id);
      if (!nombre) faltantes.push(id);
      return { id, nombre: nombre ?? `#${id}` }; 
    });

    // Si faltan, pedimos y cacheamos
    if (!faltantes.length) return;

    forkJoin(
      faltantes.map(id =>
        this.obraService.getObra(id).pipe(
          tap((o: ObraModel) =>
            this.obraService.cachearNombre(o.id!, o.nombre)
          )
        )
      )
    ).subscribe({
      next: (obras: ObraModel[]) => {
        const mapa = new Map<number, string>(
          obras.map(o => [o.id!, o.nombre])
        );

        this.obrasVinculadas = this.obrasVinculadas.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre,
        }));
      },
      error: (e) => {
        console.error('No se pudieron obtener algunas obras:', e);
      },
    });
  }

  //=====ARQUITECTOS===================
  private cargarArquitectosVinculadosPorIds(ids: number[]): void {
    if (!ids?.length) {
      this.arquitectosVinculados = [];
      return;
    }

    const faltantes: number[] = [];

    this.arquitectosVinculados = ids.map(id => {
      const nombreEnCache = this.usuarioService.getNombreById(id);

      if (!nombreEnCache) {
        faltantes.push(id);
      }

      return {
      id,
      nombre: nombreEnCache ?? `#${id}`,   
      };
    });

    // 2) Si ya tengo todos los nombres en cache
    if (!faltantes.length) return;

    // 3) Pido solo los que faltan
    forkJoin(
      faltantes.map(id =>
        this.usuarioService.getUsuario(String(id)).pipe(
          tap((u: UsuarioModel) => {
            const nombreCompleto = `${u.nombre} ${u.apellido}`.trim();
            this.usuarioService.cachearNombre(u.id!, nombreCompleto);
          })
        )
      )
    ).subscribe({
      next: (usuarios: UsuarioModel[]) => {
        const mapa = new Map<number, string>(
          usuarios.map(u => [u.id!, `${u.nombre} ${u.apellido}`.trim()])
        );

        // 4) Reemplazo placeholders #id por el nombre real
        this.arquitectosVinculados = this.arquitectosVinculados.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre, // si alguno falla, queda #id
        }));
      },
      error: (e) => {
        console.error('No se pudieron obtener algunos arquitectos:', e);
      },
    });
  }

  //===============IMAGEN====================
  imgSrc(nombre?: string): string {
    if (!nombre) return this.imagenDefecto;

    const path = nombre.startsWith('/') ? nombre : `/${nombre}`;
    return `${environment.apiUrl}${path}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;
    img.src = `${location.origin}/${this.imagenDefecto.replace(/^\/+/, '')}`;
  }

  
  //=========ROLES====================
  puedeGestionar(): boolean {
 
    if (!this.estudio?.id) return false;

    // ADMIN siempre puede
    if (this.tokenSrv.isAdmin()) return true;

    // Si no es arquitecto, no puede
    if (!this.tokenSrv.isArquitecto()) return false;

    // Arquitecto: solo si este estudio está en sus idEstudios
    return this.idsEstudiosUsuario.includes(this.estudio.id);
  }


  editar(): void {
    if (!this.estudio?.id) return;
    this.router.navigate(['/estudios', this.estudio.id, 'editar']);
  }

  private eliminarEstudio(): void {
    if (!this.estudio?.id) return;

    this.estudioService.deleteEstudio(this.estudio.id).subscribe({
      next: () => {
        this.mostrarModal(
          'Estudio eliminado',
          'El estudio fue eliminado correctamente.',
          'success',
          {
            mostrarCruz: false,
            mostrarBotonAceptar: true,
            mostrarBotonCancelar: false,
            cerrarAlClickFuera: false,
          }
        );
      },
      error: (e) => {
        console.error(e);

        if (e.status === 409) {
          this.mostrarModal(
            'No se puede eliminar',
            'El estudio tiene obras asociadas. Debe eliminarlas primero.',
            'warning'
          );
        } else if (e.status === 404) {
          this.mostrarModal(
            'Estudio no encontrado',
            'El estudio ya no existe.',
            'warning'
          );
        } else if (e.status >= 500) {
          this.mostrarModal(
            'Error del servidor',
            'Ocurrió un error al intentar eliminar el estudio.',
            'error'
          );
        } else {
          this.mostrarModal(
            'Error inesperado',
            'El proceso de eliminación falló por un motivo desconocido.',
            'error'
          );
        }
      },
    });
  }

  eliminar(): void {
    this.confirmarEliminacion();
  }
}
