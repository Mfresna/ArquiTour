import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { salirSinGuardarGuard } from './salir-sin-guardar-guard';

describe('salirSinGuardarGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => salirSinGuardarGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
