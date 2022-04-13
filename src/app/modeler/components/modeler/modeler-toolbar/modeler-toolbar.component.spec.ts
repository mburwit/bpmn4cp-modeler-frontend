import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {ModelerToolbarComponent} from "./modeler-toolbar.component";
import {ModelerModule} from "../../../modeler.module";

describe("ModelerToolbarComponent", () => {
  let component: ModelerToolbarComponent;
  let fixture: ComponentFixture<ModelerToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModelerModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelerToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
