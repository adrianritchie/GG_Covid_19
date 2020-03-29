import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';


export const checkPasswords: ValidatorFn = (passwordRepeat: FormControl): ValidationErrors | null => {

  const password = passwordRepeat?.parent?.get('password');

  console.log(password?.value);
  console.log(passwordRepeat?.value);

  return password && passwordRepeat && password.value === passwordRepeat.value ? null : { notSame: true };
};


@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.sass']
})
export class RegisterModalComponent implements OnInit {

  loginForm = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      Validators.minLength(8)
    ]],
    passwordRepeat: ['', [
      Validators.required,
      checkPasswords
    ]],
    agree: [false, [
      Validators.required,
      Validators.requiredTrue
    ]]
  });

  saving = false;
  registered = false;
  failed = false;

  constructor(private fb: FormBuilder, private auth: AuthService) { }

  ngOnInit() {

  }

  async register() {
    this.saving = true;
    this.failed = false;
    try {
      await this.auth.registerWithEmail(this.email.value, this.password.value);
      this.registered = true;
    } catch (err) {
      console.log(err);
      this.failed = true;
    }
    this.saving = false;
  }

  resetForm(really) {
    if (really) {
      this.loginForm.reset();
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get passwordRepeat() {
    return this.loginForm.get('passwordRepeat');
  }

  get agree() {
    return this.loginForm.get('agree');
  }

}
