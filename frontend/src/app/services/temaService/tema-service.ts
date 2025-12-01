import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemaService {

    /** Alterna entre claro y oscuro y lo guarda en localStorage */
  toggleTema(): void {
    const html = document.documentElement;

    const actual = html.getAttribute('data-tema') === 'oscuro'
      ? 'oscuro'
      : 'claro';

    const nuevo = actual === 'oscuro' ? 'claro' : 'oscuro';

    html.setAttribute('data-tema', nuevo);
    localStorage.setItem('tema', nuevo);
  }

  /** Aplica el tema guardado al iniciar la app */
  aplicarTemaGuardado(): void {
    const guardado = (localStorage.getItem('tema') as 'claro' | 'oscuro' | null) ?? 'claro';
    document.documentElement.setAttribute('data-tema', guardado);
  }

  getTemaActual(): 'claro' | 'oscuro' {
    return (document.documentElement.getAttribute('data-tema') as 'claro' | 'oscuro') ?? 'claro';
  }
  
}
