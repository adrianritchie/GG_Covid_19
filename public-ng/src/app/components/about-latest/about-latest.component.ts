import { Component, OnInit } from '@angular/core';
import { LatestDataService } from 'src/app/services/latest-data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-about-latest',
  templateUrl: './about-latest.component.html',
  styleUrls: ['./about-latest.component.sass']
})
export class AboutLatestComponent implements OnInit {

  cacheUntil: string;
  lastUpdated: string;

  loading = true;

  constructor(private latestData: LatestDataService) { }

  ngOnInit(): void {
    this.latestData.getData().subscribe(
      (data) => {
        this.cacheUntil = moment(data.cacheUntil).fromNow();
        this.lastUpdated = moment(data.Updated).calendar();
        this.loading = false;
      }
    );
  }

}
