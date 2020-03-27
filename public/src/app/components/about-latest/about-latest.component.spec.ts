import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutLatestComponent } from './about-latest.component';

describe('AboutLatestComponent', () => {
  let component: AboutLatestComponent;
  let fixture: ComponentFixture<AboutLatestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutLatestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
