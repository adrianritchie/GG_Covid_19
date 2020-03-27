import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangesChartComponent } from './changes-chart.component';

describe('ChangesChartComponent', () => {
  let component: ChangesChartComponent;
  let fixture: ComponentFixture<ChangesChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
