import { TestBed } from '@angular/core/testing';

import { NgNumberInputService } from './ng-number-input.service';

describe('NgNumberInputService', () => {
  let service: NgNumberInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgNumberInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
