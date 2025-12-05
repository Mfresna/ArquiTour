import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-bienvenida',
  imports: [],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {
    
  openSection: 'nosotros' | 'obras' | 'favoritos' | null = 'nosotros';

  toggle(seccion: 'nosotros' | 'obras' | 'favoritos') {
    this.openSection = seccion;
  }
}
