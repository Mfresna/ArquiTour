import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-esperando-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './esperando-modal.html',
  styleUrl: './esperando-modal.css',
})
export class EsperandoModal {
  //Datos por Defecto
  @Input() isVisible: boolean = false;
  @Input() mensaje: string = 'Cargando...';
}
