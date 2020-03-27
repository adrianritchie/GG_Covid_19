import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregateChartComponent } from './aggregate-chart.component';

describe('AggregateChartComponent', () => {
  let component: AggregateChartComponent;
  let fixture: ComponentFixture<AggregateChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregateChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregateChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
