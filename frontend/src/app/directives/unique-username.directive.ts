import { Directive } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

// TODO: implement once services is working

@Directive({
  selector: '[appUniqueUsername]'
})

export class UniqueUsernameDirective implements AsyncValidator {

  constructor() { }
  validate(control: AbstractControl<any, any>): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    throw new Error('Method not implemented.');
  }
  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }

}
