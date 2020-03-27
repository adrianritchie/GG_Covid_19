import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GraphDataService } from 'src/app/services/graph-data.service';
import * as moment from 'moment';


@Component({
  selector: 'app-changes-chart',
  templateUrl: './changes-chart.component.html',
  styleUrls: ['./changes-chart.component.sass']
})
export class ChangesChartComponent implements OnInit {

  plotData = [];
  plotly: any;

  constructor(private graphData: GraphDataService) { }

  ngOnInit(): void {
    this.plotly = environment.plotly;

    this.graphData.getData().subscribe(data => {
      this.plotData = this.prepareGraphData(data);
      window.dispatchEvent(new Event('resize'));
    });
  }
  prepareGraphData(data: any) {
    const filteredData = [];

    for (let i = 0; i < data.Updated.length; i++) {
      const current = moment(data.Updated[i]).startOf('day');

      if (i === 0 || current < filteredData[filteredData.length - 1].Day) {
        const record = {
          Day: current,
          Tested: data['Number of samples tested'][i],
          Returned: data['Negative results'][i] + data['Positive results'][i],
          Pending: data['Awaiting results'][i],
        };
        filteredData.push(record);
      }
    }

    console.log(filteredData);

    const diffTested = [];
    const diffReturned = [];
    const diffPending = [];
    filteredData
      .sort((a, b) => a.Day - b.Day)
      .forEach((v, i, d) => {
        if (i === 0) {
          diffPending.push({ Day: v.Day.toDate(), Pending: v.Pending });
          return;
        }
        if (v.Tested > d[i - 1].Tested) {
          diffTested.push({
            Day: v.Day.toDate(),
            Tested: v.Tested - d[i - 1].Tested
          });
        }
        if (v.Returned > d[i - 1].Returned) {
          diffReturned.push({
            Day: v.Day.toDate(),
            Returned: v.Returned - d[i - 1].Returned
          });
        }
        diffPending.push({ Day: v.Day.toDate(), Pending: v.Pending });
      });

    return [
      {
        name: 'Tested',
        x: diffTested.map((v) => v.Day),
        y: diffTested.map((v) => v.Tested),
        type: 'bar',
        marker: { color: '#CBD081' }
      },
      {
        name: 'Returned',
        x: diffReturned.map((v) => v.Day),
        y: diffReturned.map((v) => -v.Returned),
        type: 'bar',
        marker: { color: '#58A4B0' }
      },
      {
        name: 'Awaiting Results',
        x: diffPending.map((v) => v.Day),
        y: diffPending.map((v) => v.Pending),
        type: 'scatter',
        marker: { color: 'rgb(255, 127, 14)' },
        mode: 'lines+markers',
        line: { shape: 'spline' }
      }
    ];
  }
}
