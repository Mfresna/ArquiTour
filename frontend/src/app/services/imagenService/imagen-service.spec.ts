import { TestBed } from '@angular/core/testing';

import { ImagenSerrvice } from './imagen-serrvice';

describe('ImagenSerrvice', () => {
  let service: ImagenSerrvice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagenSerrvice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
