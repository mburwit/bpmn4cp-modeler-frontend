import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {ModelerComponent} from "./modeler.component";
import {ModelerModule} from "../../modeler.module";

describe("ModelerComponent", () => {
  let component: ModelerComponent;
  let fixture: ComponentFixture<ModelerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModelerModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
