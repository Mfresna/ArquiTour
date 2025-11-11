import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida contraseñas según política:
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Solo letras, números y @ . _ ! + -
 */

export const caracteresValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value ?? '';

  if (!value) return null;

  const errors: ValidationErrors = {};

  if (!/[A-Z]/.test(value)) {
    errors['mayuscula'] = true;
  }

  if (!/[a-z]/.test(value)) {
    errors['minuscula'] = true;
  }

  if (!/\d/.test(value)) {
    errors['faltaNumero'] = true;
  }

  if (/[^A-Za-z\d@._!+\-]/.test(value)) {
    errors['caracterNoPermitido'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};
