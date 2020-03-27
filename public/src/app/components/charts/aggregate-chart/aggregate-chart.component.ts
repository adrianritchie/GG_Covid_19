import { Component, OnInit } from '@angular/core';
import { GraphDataService } from 'src/app/services/graph-data.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-aggregate-chart',
  templateUrl: './aggregate-chart.component.html',
  styleUrls: ['./aggregate-chart.component.sass']
})
export class AggregateChartComponent implements OnInit {

  plotData = [];
  plotly: any;

  constructor(private graphData: GraphDataService) { }

  ngOnInit(): void {
    this.plotly = environment.plotly;

    this.graphData.getData().subscribe(data => {
      const updated = data.Updated;
      const ignoreKeys = ['cacheUntil', 'Updated', 'Saved'];

      for (const key in data) {
        if (ignoreKeys.indexOf(key) === -1) {
          this.plotData.push({
            name: key,
            x: updated,
            y: data[key],
            type: 'scatter',
            mode: 'lines+markers',
            line: {
              color: environment.colours[key]
            }
          });
        }
      }
      window.dispatchEvent(new Event('resize'));
    });
  }
}
