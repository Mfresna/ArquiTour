import { CommonModule } from '@angular/common';
import {Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-pin-verificador',
  imports: [CommonModule],
  templateUrl: './pin-verificador.html',
  styleUrl: './pin-verificador.css',
})
export class PinVerificador {
  
  @Output() pinCompleto = new EventEmitter<string>();
  @Output() pinIncompleto = new EventEmitter<void>();
  @Output() enFocus = new EventEmitter<void>();

  @Input() invalido: boolean = false;

  readonly boxes = Array.from({ length: 6 });
  digits: string[] = Array(6).fill('');

  //Permite manipular los hijos box del html
  @ViewChildren('box') boxesRefs!: QueryList<ElementRef<HTMLInputElement>>;


  //=================== PRESIONADO DE TECLAS ================// 
  onInput(e: Event, i: number) {

    //Agarra cada elemento del del html (box) y lo convierte a numero
    const el = e.target as HTMLInputElement;
    const raw = el.value.replace(/\D/g, '');

    if (!raw) {
      //si lo que ingreso no es numero lo limpio
      this.digits[i] = '';
      this.emiteElPin();
      return;
    }

    let idx = i;
    for (const c of raw) {
      //recorro tod la entrada por si pego mas de 1 digito
      if (idx > 5) break;
      this.digits[idx++] = c;
    }


    // Sincronizar UI del input actual
    el.value = this.digits[i] ?? '';

    // Mover foco
    const next = Math.min(i + raw.length, 5);
    this.focusBox(next);

    //Lo emite solo si llega a 6 pines
    this.emiteElPin();  
  }

 //=================== NAVEGACION PEGADO Y BORRADO ================// 
  onKeyDown(e: KeyboardEvent, i: number) {
    const key = e.key;

    //Permite pegar el codigo
    if ((e.ctrlKey || e.metaKey) && (key === 'v' || key === 'V')) return; // Pegar
    if (e.shiftKey && key === 'Insert') return; // Pegar con Shift+Insert

    //Navego con las flechas
    if (key === 'ArrowLeft' && i > 0) { e.preventDefault(); this.focusBox(i - 1); return; }
    if (key === 'ArrowRight' && i < 5) { e.preventDefault(); this.focusBox(i + 1); return; }
    if (key === 'Backspace') {
      if (this.digits[i]) { this.digits[i] = ''; }
      else if (i > 0) { e.preventDefault(); this.digits[i - 1] = ''; this.focusBox(i - 1); }
      this.emiteElPin();
      return;
    }
    if (key === 'Delete') { this.digits[i] = ''; this.emiteElPin(); return; }

    // Solo permite numeros si no es nada de arriba
    if (!/^\d$/.test(key)) e.preventDefault();
  }

  //=================== PEGADO DEL CODIGO ================// 
  onPaste(e: ClipboardEvent, i: number) {

      // 'e' es el portapapeles
    e.preventDefault();
    const txt = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;

    let idx = i;
    for (const c of txt) {
      if (idx > 5) break;
      this.digits[idx++] = c;
    }

      // Actualizar lo que se ve en cada input
    this.refreshInputsUI();

      // Foco al primer vacío o al último si completo
    const firstEmpty = this.digits.findIndex(d => d === '');
    this.focusBox(firstEmpty === -1 ? 5 : firstEmpty);

       //dentro valida si esta completo para emitir o no
    this.emiteElPin(); 
  }

  //=================== ACCIONES ESPECIFICAS ================// 
  private emiteElPin() {
    //junta todos los digitos
    const pin = this.digits.join('');

    if (pin.length === 6 && this.digits.every(d => d !== '')) {
        //emite el pin solo si esta completo
      this.pinCompleto.emit(pin);
    }else {
     this.pinIncompleto.emit();
    }
  }

  private focusBox(i: number) {
      //Hace foco en el box del arreglo 'i'
    const el = this.boxesRefs?.get(i)?.nativeElement;
    el?.focus();
    el?.select();
  }

  private refreshInputsUI() {
      //Refresca todos los boxes
    this.boxesRefs?.forEach((ref, idx) => {
      ref.nativeElement.value = this.digits[idx] ?? '';
    });
  }

  emitirFocus(){
    const pin = this.digits.join('');
    if(this.invalido){
      this.enFocus.emit();
    }
  }
}