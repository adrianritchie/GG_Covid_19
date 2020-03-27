import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsLayoutComponent } from './charts-layout.component';

describe('ChartsLayoutComponent', () => {
  let component: ChartsLayoutComponent;
  let fixture: ComponentFixture<ChartsLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
