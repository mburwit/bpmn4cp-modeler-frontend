import { TestBed } from '@angular/core/testing';

import { CodeSystemService } from './code-system.service';

describe('CodeSystemService', () => {
  let service: CodeSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
