import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User>;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.user$ = this.afAuth.authState;
  }

  async googleSignIn() {
    const provider = new auth.GoogleAuthProvider();
    await this.afAuth.auth.signInWithPopup(provider);
    if (!this.afAuth.auth.currentUser.emailVerified) {
      this.afAuth.auth.currentUser.sendEmailVerification();
    }
  }

  async emailSignIn(email: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  async registerWithEmail(email: string, password: string) {
    await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    await this.afAuth.auth.currentUser.sendEmailVerification();
  }

  async signOut() {
    await this.afAuth.auth.signOut();
  }

  async unregister() {
    await this.afAuth.auth.currentUser.delete();
  }
}
