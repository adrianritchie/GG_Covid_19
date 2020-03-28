import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {

  constructor(private analytics: AngularFireAnalytics, public auth: AuthService) {
  }

  ngOnInit(): void {
  }

  openingModal(modal) {
    this.analytics.logEvent(`${modal}_modal_shown`);
  }

}
