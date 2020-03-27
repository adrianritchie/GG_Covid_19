import { TestBed } from '@angular/core/testing';

import { LatestDataService } from './latest-data.service';

describe('LatestDataService', () => {
  let service: LatestDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LatestDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
