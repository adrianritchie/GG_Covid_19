import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LatestDataService {
  private readonly dataUrl: string = 'https://europe-west2-gg-covid-19.cloudfunctions.net/latestData';

  private response$: any;

  constructor(private http: HttpClient) { }

  getData() {
    if (!this.response$) {
      this.response$ = this.http.get(this.dataUrl).pipe(shareReplay(1));
    }
    return this.response$;
  }
}
