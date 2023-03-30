import { TestBed } from '@angular/core/testing';

import { MetatypeService } from './metatype.service';

describe('MetatypeService', () => {
  let service: MetatypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetatypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
