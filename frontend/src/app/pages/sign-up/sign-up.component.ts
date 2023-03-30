import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { equalPasswordsValidator } from 'src/app/directives/equal-passwords.directive';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService
  ) {
    this.signUpForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern('^[a-zA-Z0-9]*$'),
          ],
        ], 
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
            ),
          ],
        ], // min. 8 chars, at least 1 letter, at least 1 num
        confirmPassword: ['', [Validators.required]],
      },
      { validator: equalPasswordsValidator }
    );
  }

  ngOnInit(): void {}

  signUp() {
    this.api
      .signUp(this.signUpForm.value.username, this.signUpForm.value.password)
      .subscribe({
        next: () => {
          this.api
            .signIn(
              this.signUpForm.value.username,
              this.signUpForm.value.password
            )
            .subscribe({
              next: () => {
                this.router.navigate(['/visualizations']);
              },
              error: (err) => {
                this.error = err.error.error;
              },
            });
        },
        error: (err) => {
          this.error = err.error.error;
        },
      });
  }
}
