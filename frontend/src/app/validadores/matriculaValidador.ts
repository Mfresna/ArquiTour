import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const matriculaValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';

  if (!value) return null;

  const errors: ValidationErrors = {};

  if (/\s/.test(value)) {
    errors['espacios'] = true;
    return errors;
  }

  const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.\-]+$/;
  if (!regex.test(value)) {
    errors['formato'] = true;
    return errors;
  }

  const cantidadGuiones = (value.match(/-/g) || []).length;
  if (cantidadGuiones > 2) {
    errors['guiones'] = true;
    return errors;
  }

  const cantidadPuntos = (value.match(/\./g) || []).length;
  if (cantidadPuntos > 2) {
    errors['puntos'] = true;
    return errors;
  }

  return null;
};
