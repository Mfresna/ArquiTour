import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export const fechaNacValidador = (edadMinima: number): ValidatorFn => {

  return (control: AbstractControl): ValidationErrors | null => {
    let value = control.value;

    if (!value) return null;

    let fecha = new Date(value);
    const hoy = new Date();

    let errores: ValidationErrors = {};

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
      errores['edadMinima'] = true;
    }

    //FECHA ANTERIOR LIMITE
    const fechaAnteriorLimite = new Date(1900,0,1);

    if (fecha < fechaAnteriorLimite) {
      errores['fechaLimite'] = true;
    }

    return Object.keys(errores).length ? errores : null;
  };
};
