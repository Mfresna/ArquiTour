import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nombreValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const NOMBRE_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/;

    const value = control.value ?? '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};

    if(value.trim().length === 0){
        errors['espacios'] = true;
    }

    if(!NOMBRE_PATTERN.test(value.toString().trim())){
        errors['formato'] = true;
    }

    return Object.keys(errors).length ? errors : null;
}

export const apellidoValidador: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const APELLIDO_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+){0,3}$/;
    
    const value = control.value ?? '';
    
    if (!value) return null;

    const errors: ValidationErrors = {};

    if(value.trim().length === 0){
        errors['espacios'] = true;
    }

    if(!APELLIDO_PATTERN.test(value.toString().trim())){
        errors['formato'] = true;
    }

    return Object.keys(errors).length ? errors : null;
}


