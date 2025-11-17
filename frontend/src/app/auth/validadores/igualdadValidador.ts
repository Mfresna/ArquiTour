import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Valida que dos campos de un FormGroup sean iguales.
 * @param campo nombre del control principal (ej: 'password')
 * @param confirmCampo nombre del control de confirmación (ej: 'confirmPassword')
 */

export function CamposIguales(campo: string, confirmCampo: string): ValidatorFn {

  return (group: AbstractControl): ValidationErrors | null => {
    const ctrl = group.get(campo);
    const confirm = group.get(confirmCampo);
    
    if (!ctrl || !confirm) return null;

    const iguales = ctrl.value?.trim() === confirm.value?.trim();

    // Marca error SOLO en el confirmCampo
    if (!iguales) {
      const errors = confirm.errors || {};

      if (!errors['iguales']) {
        confirm.setErrors({...errors, iguales: true });
      }
      return { iguales: true };
    } else {
      if (confirm.hasError('iguales')) {
        const { iguales, ...rest } = confirm.errors || {};
        confirm.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }
  };
}
