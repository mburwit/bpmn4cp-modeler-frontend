import {TestBed} from "@angular/core/testing";

import {TemplateService} from "./template.service";
import {HttpClientModule} from "@angular/common/http";
import {FhirRestfulClientService} from "../fhir/fhir-restful-client.service";
import {Bpmn2fhirService} from "../fhir/bpmn2fhir.service";

describe("TemplateService", () => {
  let service: TemplateService;
  const fhirServiceStub = {};
  const bpmn2fhirServiceStub = {};
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        {provide: FhirRestfulClientService, useValue: fhirServiceStub},
        {provide: Bpmn2fhirService, useValue: bpmn2fhirServiceStub}
      ]
    });
    service = TestBed.inject(TemplateService);
  });

  it("should be created", () => {
    const s: TemplateService = TestBed.inject(TemplateService);
    expect(s).toBeTruthy();
  });
});
