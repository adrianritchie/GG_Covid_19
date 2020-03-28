import { Component, OnInit } from '@angular/core';
import { LatestDataService } from 'src/app/services/latest-data.service';

@Component({
  selector: 'app-latest-values',
  templateUrl: './latest-values.component.html',
  styleUrls: ['./latest-values.component.sass']
})
export class LatestValuesComponent implements OnInit {

  awaiting: number;
  tested: number;
  pending: number;
  negative: number;
  positive: number;

  loading = true;

  constructor(private latestData: LatestDataService) { }

  ngOnInit(): void {
    this.latestData.getData().subscribe(
      (data) => {
        this.awaiting = data['Awaiting Testing'];
        this.tested = data['Number of samples tested'];
        this.pending = data['Awaiting results'];
        this.negative = data['Negative results'];
        this.positive = data['Positive results'];
        this.loading = false;
      }
    );
  }

}
