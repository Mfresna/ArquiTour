import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FavoritoBasicoModel } from '../../models/favoritosModels/favoritoBasicoModel';
import { FavoritosService } from '../../services/favoritosService/favoritos-service';

@Component({
  selector: 'app-select-favorito',
  imports: [],
  templateUrl: './select-favorito.html',
  styleUrl: './select-favorito.css',
})
export class SelectFavorito implements OnInit {

  @Input({ required: true }) obraId!: number;

  @Output() cerrado = new EventEmitter<void>();
  @Output() estadoFavoritoCambio = new EventEmitter<boolean>();

  listas: FavoritoBasicoModel[] = [];
  listasConObra = new Set<number>();

  cargando = false;

  // Mensaje de error
  mensajeErrorCreacion: string | null = null;



  constructor(
    private favoritosService: FavoritosService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cargarListas();
  }

  // Cargar todas las listas
 
  private cargarListas(): void {
    this.cargando = true;

    this.favoritosService.getFavoritosDelUsuario().subscribe({
      next: listas => {
        this.listas = listas ?? [];
        this.cargando = false;
        this.verificarObraEnListas();
      },
      error: (e) => {
        this.cargando = false;

        console.error(e);

        if(e.status === 404){
          alert("No se encontraron los Datos de Usuario");
        }else if(e.status >= 500){
          alert("Error del Servidor");
        }else{
          alert("Error Inesperado");
        }
        
      }
    });
  }


  // Verificar si la obra está dentro de cada lista
 
  private verificarObraEnListas(): void {
    this.listasConObra.clear();

    this.listas.forEach(lista => {
      this.favoritosService.getObrasDeFavorito(lista.id).subscribe({
        next: obras => {
          if (obras.some(o => o.id === this.obraId)) {
            this.listasConObra.add(lista.id);
          }
          this.emitirEstadoGlobal();
        },
        error: (e) =>{

          console.error(e);

          if(e.status === 404){
            alert("No se encontraron los Datos de Usuario");
          }else if(e.status >= 500){
            alert("Error del Servidor");
          }else{
            alert("Error Inesperado");
          }

        }
      });
    });
  }

  // Saber si está en una lista (para mostrar el ícono correcto)
  estaEnLista(idLista: number): boolean {
    return this.listasConObra.has(idLista);
  }


  // Agrega o elimina según corresponda

  estadoLista(listaId: number): void {
    if (this.estaEnLista(listaId)) {
      this.removerDeLista(listaId);
    } else {
      this.agregarALista(listaId);
    }
  }

  // AGREGAR obra a lista

  private agregarALista(idLista: number): void {
    this.favoritosService.putObraAFavorito(idLista, this.obraId).subscribe({
      next: () => {
        this.listasConObra.add(idLista);
        this.emitirEstadoGlobal();
      },
      error: (e) => {

        alert("No se pudo agregar la obra")

        console.error(e);

        if(e.status === 404){
          alert("No se encontraron los Datos de Usuario");
        }else if(e.status >= 500){
          alert("Error del Servidor");
        }else{
          alert("Error Inesperado");
        }

      }
    });
  }


  // REMOVER obra de lista

  private removerDeLista(idLista: number): void {
    this.favoritosService.deleteObraDeFavorito(idLista, this.obraId).subscribe({
      next: () => {
        this.listasConObra.delete(idLista);
        this.emitirEstadoGlobal();
      },
      error: (e) => {

        alert("No se pudo remover la obra")

        console.error(e);

        if(e.status === 404){
        alert("No se encontraron los Datos de Usuario");
        }else if(e.status >= 500){
          alert("Error del Servidor");
        }else{
          alert("Error Inesperado");
        }

      }
    });
  }


  // Crear una lista nueva y agregar la obra
  crearLista(input: HTMLInputElement): void {
    const limpio = input.value.trim();

    // limpio mensaje previo
    this.mensajeErrorCreacion = null;

    // 1) Validación: vacío
    if (!limpio) {
      this.mensajeErrorCreacion = 'Ingrese un nombre para la lista.';
      input.focus();
      return;
    }

    // 2) Validación: nombre duplicado (case-insensitive)
    const yaExiste = this.listas.some(
      l => l.nombre.trim().toLowerCase() === limpio.toLowerCase()
    );

    if (yaExiste) {
      this.mensajeErrorCreacion = 'Ya existe una lista con ese nombre.';
      input.focus();
      return;
    }

    // 3) Si pasa las validaciones, creo la lista
    this.favoritosService
      .crearOActualizarFavorito(limpio, [this.obraId])
      .subscribe({
        next: (resp) => {
          // recargo listas para ver la nueva
          this.cargarListas();

          // limpio input
          input.value = '';

          // scrolleo al final para que se vea la nueva lista
          setTimeout(() => {
            const cont = document.querySelector('.scroll') as HTMLElement | null;
            if (cont) {
              cont.scrollTop = cont.scrollHeight;
            }
          }, 0);

          // borro el mensaje de error si todo salió bien
          this.mensajeErrorCreacion = null;

        },
        error: (e) => {
          this.mensajeErrorCreacion = 'No se pudo crear la lista.';
          
          console.error(e);
        }
      });
  }


  // Avisar al padre
 
  private emitirEstadoGlobal(): void {
    this.estadoFavoritoCambio.emit(this.listasConObra.size > 0);
  }

  cerrar(): void {
    this.cerrado.emit();
  }


     //========== ESCUCHADORES
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: any) { 
    this.cerrar();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    // Usamos ElementRef para verificar si el clic fue dentro o fuera de nuestro componente.
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    // Si el clic fue FUERA, cerramos el menú.
    if (!clickedInside) {
          this.cerrar();
    }
  
  }
  
}

  
