import { Component } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  constructor() {
  }

}
