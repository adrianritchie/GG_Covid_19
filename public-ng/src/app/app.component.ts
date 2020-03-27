import { Component } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  constructor(private analytics: AngularFireAnalytics) {
  }

  openingModal(modal) {
    this.analytics.logEvent(`${modal}_modal_shown`);
  }
}
