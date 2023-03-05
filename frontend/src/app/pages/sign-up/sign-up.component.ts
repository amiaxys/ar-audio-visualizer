import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { equalPasswordsValidator } from 'src/app/directives/equal-passwords.directive';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  error = '';

  constructor (private fb: FormBuilder, private router: Router) {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // TODO: implement once uniqueUsernameValidator is working
      password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]], // min. 8 chars, at least 1 letter, at least 1 num 
      confirmPassword: ['', [Validators.required]]
    }, {validator: equalPasswordsValidator});
  }

  get username() { return this.signUpForm.get('username') }

  signUp() {
    console.log(this.signUpForm);
    this.router.navigate(['/']);
  }
}

