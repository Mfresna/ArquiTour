import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export const fechaNacimientoValidador = (edadMinima: number): ValidatorFn => {

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const fecha = new Date(value);
    const hoy = new Date();

    const errores: ValidationErrors = {};

    //LA FECHA VALIDA
    if (isNaN(fecha.getTime())) {
        //Solo devuelve el error formato, no tiene sentido que siga evaluando
      errores['formato'] = true;
      return errores;
    }

    //QUE SEA FECHA ANTERIOR
    if (fecha >= hoy) {
      errores['fechaFutura'] = true;
    }

    //EDAD MINIMA
    const fechaLimite = new Date(
      hoy.getFullYear() - edadMinima,
      hoy.getMonth(),
      hoy.getDate()
    );

    if (fecha > fechaLimite) {
      errores['edadMinima'] = { requerida: edadMinima };
    }

    return Object.keys(errores).length ? errores : null;
  };
};
