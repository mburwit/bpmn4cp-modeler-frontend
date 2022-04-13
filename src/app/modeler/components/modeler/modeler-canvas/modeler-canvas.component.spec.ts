import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {ModelerCanvasComponent} from "./modeler-canvas.component";
import {ModelerModule} from "../../../modeler.module";

describe("ModelerCanvasComponent", () => {
  let component: ModelerCanvasComponent;
  let fixture: ComponentFixture<ModelerCanvasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModelerModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelerCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
