import { Directive } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';

export const equalPasswordsValidator: ValidatorFn = (
  c: AbstractControl
): ValidationErrors | null => {
  return c.get('password')?.value !== c.get('confirmPassword')?.value
    ? { equalPasswords: true }
    : null;
};

@Directive({
  selector: '[appEqualPasswords]',
})
export class EqualPasswordsDirective implements Validator {
  validate(c: AbstractControl): ValidationErrors | null {
    return equalPasswordsValidator(c);
  }
}
