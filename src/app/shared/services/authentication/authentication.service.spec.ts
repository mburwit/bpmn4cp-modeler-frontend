import { TestBed, inject } from "@angular/core/testing";

import { AuthenticationService } from "./authentication.service";

xdescribe("AuthenticationService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService]
    });
  });

  it("should be created", inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));
});
