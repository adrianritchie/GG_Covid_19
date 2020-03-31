import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass']
})
export class LoginModalComponent implements OnInit {

  loginForm = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required
    ]],
    passwordRepeat: ['', [
      Validators.required
    ]],
    agree: [true, [
      Validators.required,
      Validators.requiredTrue
    ]]
  });

  failed = false;

  constructor(private fb: FormBuilder, private auth: AuthService) { }

  ngOnInit() {

  }

  resetForm(really) {
    if (really) {
      this.loginForm.reset();
    }
  }

  async login() {
    this.failed = false;
    try {
      await this.auth.emailSignIn(this.email.value, this.password.value);
    } catch (err) {
      console.log(err);
      this.failed = true;
    }
  }


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
