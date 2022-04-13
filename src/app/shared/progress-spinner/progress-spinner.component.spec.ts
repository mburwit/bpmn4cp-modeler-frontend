import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {ProgressSpinnerComponent} from "./progress-spinner.component";
import {OverlayService} from "./overlay.service";
import {ProgressSpinnerService} from "./progress-spinner.service";
import {OverlayModule} from "@angular/cdk/overlay";

describe("ProgressSpinnerComponent", () => {
  let component: ProgressSpinnerComponent;
  let fixture: ComponentFixture<ProgressSpinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [ProgressSpinnerComponent],
      providers: [ProgressSpinnerService, OverlayService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
