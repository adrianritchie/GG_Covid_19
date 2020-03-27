import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestValuesComponent } from './latest-values.component';

describe('LatestValuesComponent', () => {
  let component: LatestValuesComponent;
  let fixture: ComponentFixture<LatestValuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
