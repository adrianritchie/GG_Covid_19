import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LatestValuesComponent } from './components/latest-values/latest-values.component';
import { AboutLatestComponent } from './components/about-latest/about-latest.component';
import { ApiModalComponent } from './components/modals/api-modal/api-modal.component';
import { AboutModalComponent } from './components/modals/about-modal/about-modal.component';
import { ChartsLayoutComponent } from './components/charts/charts-layout/charts-layout.component';
import { AggregateChartComponent } from './components/charts/aggregate-chart/aggregate-chart.component';
import { ChangesChartComponent } from './components/charts/changes-chart/changes-chart.component';

import { PlotlyViaCDNModule } from 'angular-plotly.js';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterModalComponent } from './components/modals/auth/register-modal/register-modal.component';
import { LoginModalComponent } from './components/modals/auth/login-modal/login-modal.component';
import { CancelModalComponent } from './components/modals/auth/cancel-modal/cancel-modal.component';
import { FightComponent } from './components/fight/fight.component';

PlotlyViaCDNModule.plotlyVersion = 'latest'; // can be `latest` or any version number (i.e.: '1.40.0')
PlotlyViaCDNModule.plotlyBundle = 'basic'; // optional: can be null (for full) or 'basic', 'cartesian',
                                           // 'geo', 'gl3d', 'gl2d', 'mapbox' or 'finance'

@NgModule({
  declarations: [
    AppComponent,
    LatestValuesComponent,
    AboutLatestComponent,
    ApiModalComponent,
    AboutModalComponent,
    ChartsLayoutComponent,
    AggregateChartComponent,
    ChangesChartComponent,
    NavbarComponent,
    RegisterModalComponent,
    LoginModalComponent,
    CancelModalComponent,
    FightComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    PlotlyViaCDNModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
