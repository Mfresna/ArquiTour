import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noBlancoEspacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    
    const value = control.value ?? '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};

    if(value.trim().length === 0){
        errors['espacios'] = true;
    }

    return Object.keys(errors).length ? errors : null;
}