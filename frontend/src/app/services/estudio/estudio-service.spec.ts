import { TestBed } from '@angular/core/testing';

import { EstudioService } from './estudio-service';

describe('EstudioService', () => {
  let service: EstudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
