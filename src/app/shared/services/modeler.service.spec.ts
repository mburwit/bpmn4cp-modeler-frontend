import { TestBed } from "@angular/core/testing";
import {ModelerService} from "./modeler.service";


describe("ModelerService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ModelerService = TestBed.inject(ModelerService);
    expect(service).toBeTruthy();
  });
});
