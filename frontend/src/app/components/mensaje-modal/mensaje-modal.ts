import { Component, EventEmitter, Input, Output } from '@angular/core';


export type MessageType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-mensaje-modal',
  imports: [],
  templateUrl: './mensaje-modal.html',
  styleUrl: './mensaje-modal.css',
})
export class MensajeModal {
  @Input() isVisible: boolean = false;
  @Input() titulo: string = 'Mensaje';
  @Input() mensaje: string = '';
  @Input() tipo: MessageType = 'info';
  @Input() conIcon: boolean = true;
  @Input() tipoContenido: 'texto' | 'html' = 'texto';
  @Input() mostrarCerrar: boolean = true;
  @Input() mostrarBotonAceptar: boolean = true;
  @Input() mostrarBotonCancelar: boolean = false;
  @Input() textoBotonAceptar: string = 'Aceptar';
  @Input() textoBotonCancelar: string = 'Cancelar';
  @Input() cerrarAlClickFuera: boolean = true;

  @Output() aceptar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrado = new EventEmitter<void>();

  onAceptar(): void {
    this.aceptar.emit();
    this.cerrar();
  }

  onCancelar(): void {
    this.cancelar.emit();
    this.cerrar();
  }

  cerrar(): void {
    this.isVisible = false;
    this.cerrado.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    //Permite hacer click fuera del modal
    if (this.cerrarAlClickFuera && event.target === event.currentTarget) {
      this.cerrar();
    }
  }
}