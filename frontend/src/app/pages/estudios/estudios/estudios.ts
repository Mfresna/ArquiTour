import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { EstudioModel } from "../../../models/estudioModels/estudioModel";
import { EstudioService } from "../../../services/estudioService/estudio-service";
import { TokenService } from "../../../auth/services/tokenService/token-service";
import { UsuarioService } from "../../../services/usuarioService/usuario-service";
import { finalize } from "rxjs";
import { EsperandoModal } from "../../../components/esperando-modal/esperando-modal";
import { MensajeModal, MessageType } from "../../../components/mensaje-modal/mensaje-modal";


@Component({
  selector: 'app-estudios',
  imports: [ReactiveFormsModule, RouterLink, EsperandoModal, MensajeModal],
  templateUrl: './estudios.html',
  styleUrl: './estudios.css',
})
export class Estudios implements OnInit {

  estudios!: EstudioModel[];
  

  imagenDefecto = `${environment.imgEstudio}`;

  filtro!: FormGroup;    

  spinerVisible: boolean = false;

    // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';
  accionPostModal: 'recargarTodo' | null = null;
  
  constructor(
    private fb: FormBuilder,
    private estudioSrvice: EstudioService,
    private tokenService: TokenService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      nombre: ['', [Validators.minLength(2)]],
    });
    this.cargarEstudios();
  }

  // ================= MODAL =================

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
    this.modalVisible = false;

    if (this.accionPostModal === 'recargarTodo') {
      this.filtro.reset({ nombre: '' });
      this.cargarEstudios();
    }

    this.accionPostModal = null;
  }

  onModalCerrado(): void {
    this.modalVisible = false;
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

    this.spinerVisible = true; 

    this.estudioSrvice.getFiltrarEstudios(nombre).pipe(
      finalize(() => this.spinerVisible = false)
    ).subscribe({
      next: lista => this.estudios = lista,
      error: (e) =>{
        if(e.status === 404){
          this.mostrarModal(
            'Sin resultados',
            'No se encontraron estudios con esos datos.',
            'info'
          );
        }else{
          this.mostrarModal(
            'Error al cargar',
            'No se pudo cargar la lista de estudios.',
            'error'
          );
        }
      } 
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset({ nombre: '' });
    this.cargarEstudios();
  }

  // Método que valida si el usuario es Arquitecto
  isArquitecto(): boolean {
    return this.tokenService.tieneRol('ROLE_ARQUITECTO');
  }

  misEstudios(): void {
    if (!this.estudios || !this.estudios.length) return;

    this.spinerVisible = true; 

    this.usuarioService.getUsuarioMe().pipe(
      finalize(() => this.spinerVisible = false)
    ).subscribe({
      next: usuario => {

        const idsEstudiosUsuario = usuario.idEstudios ?? [];

        this.estudios = this.estudios.filter(e =>
          e.id != null && idsEstudiosUsuario.includes(e.id)
      );
        if (!this.estudios.length) {
          this.mostrarModal(
            'Sin estudios propios',
            'No se encontraron estudios asociados a tu usuario.',
            'info'
          );
          this.accionPostModal = 'recargarTodo'; 
        }
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
        this.mostrarModal(
          'Error de usuario',
          'No se pudo obtener la información del usuario logueado.',
          'error'
        );
      }
    });
  }

 
}




 






