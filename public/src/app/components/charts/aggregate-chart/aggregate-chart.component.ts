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
  chartType = 'log';

  constructor(private graphData: GraphDataService) { }

  ngOnInit(): void {
    this.plotly = {
      layout: {
        margin: { t: 15, b: 30 },
        width: '100%',
        autosize: true,
        showlegend: true,
        legend: { x: 0.5, y: -0.3 },
        xaxis: { showgrid: true },
        yaxis: { type: 'log', autorange: true }
      },
      config: { scrollZoom: true, responsive: true },
      style: { height: '600px', width: '100%' },
    };

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

  logGraph(): void {
    this.chartType = 'log';
    this.plotly.layout.yaxis = { type: 'log', autorange: true };
    window.dispatchEvent(new Event('resize'));
  }

  linearGraph(): void {
    this.chartType = 'linear';
    this.plotly.layout.yaxis = { type: 'linear', autorange: true };
    window.dispatchEvent(new Event('resize'));
  }
}
