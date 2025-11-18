import { CanDeactivateFn } from '@angular/router';

export interface TieneCambiosPendientes {
  tieneCambiosPendientes: () => boolean;
}

export const salirSinGuardarGuard: CanDeactivateFn<TieneCambiosPendientes> = (component) => {

    // Si el componente no implementa el método, permitir salir
    if (!component?.tieneCambiosPendientes) return true;

    // Si NO hay cambios: dejar salir
    if (!component.tieneCambiosPendientes()) return true;

    // Si HAY cambios: preguntar
    return confirm('Tenés cambios sin guardar. ¿Querés abandonar la página?');

};
