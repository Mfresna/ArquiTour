import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const obraNombreValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const OBRA_NOMBRE_PATTERN = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-\:\.,¡!¿\?@()\/]+$/;

    const value = control.value ?? '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};

    if(value.trim().length === 0){
        errors['espacios'] = true;
    }

    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value.toString().trim())){
        errors['sinLetras'] = true;
    }

    if(!OBRA_NOMBRE_PATTERN.test(value.toString().trim())){
        errors['formato'] = true;
    }

    return Object.keys(errors).length ? errors : null;
}

export const estudioNombreValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const ESTUDIO_NOMBRE_PATTERN = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-\:\.,¡¿\?()\/_+\$]+$/;

    const value = control.value ?? '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};

    if(value.trim().length === 0){
        errors['espacios'] = true;
    }

    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value.toString().trim())){
        errors['sinLetras'] = true;
    }

    if(!ESTUDIO_NOMBRE_PATTERN.test(value.toString().trim())){
        errors['formato'] = true;
    }

    return Object.keys(errors).length ? errors : null;
}
