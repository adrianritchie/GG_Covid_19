import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiModalComponent } from './api-modal.component';

describe('ApiModalComponent', () => {
  let component: ApiModalComponent;
  let fixture: ComponentFixture<ApiModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
