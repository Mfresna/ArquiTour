import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const matriculaValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';

  if (!value) return null;

  const errors: ValidationErrors = {};

  if (/\s/.test(value)) {
    errors['espacios'] = true;
    return errors;
  }

  if (/["'\\]/.test(value)) {
    errors['caracteresInvalidos'] = true;
    return errors;
  }

  return null;
};
