import { TestBed } from '@angular/core/testing';

import { FhirRestfulClientService } from "./fhir-restful-client.service";
import {HttpClientModule} from "@angular/common/http";

describe("FhirRestfulClientService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it("should be created", () => {
    const service: FhirRestfulClientService = TestBed.inject(FhirRestfulClientService);
    expect(service).toBeTruthy();
  });
});
