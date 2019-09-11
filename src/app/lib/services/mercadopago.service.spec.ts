import { TestBed } from '@angular/core/testing';

import { RafflesService } from './mercadopago.service';

describe('RafflesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RafflesService = TestBed.get(RafflesService);
    expect(service).toBeTruthy();
  });
});
