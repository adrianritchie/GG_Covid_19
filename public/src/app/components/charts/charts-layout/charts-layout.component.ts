import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { GraphDataService } from 'src/app/services/graph-data.service';

@Component({
  selector: 'app-charts-layout',
  templateUrl: './charts-layout.component.html',
  styleUrls: ['./charts-layout.component.sass']
})
export class ChartsLayoutComponent implements OnInit {

  loading = true;

  constructor(private graphData: GraphDataService, private analytics: AngularFireAnalytics) { }

  ngOnInit(): void {
    this.graphData.getData().subscribe(data => this.loading = false);
  }

  windowResize($event, clicked) {
    window.dispatchEvent(new Event('resize'));
    this.analytics.logEvent('switch_chart',  { chart : clicked });
  }
}
