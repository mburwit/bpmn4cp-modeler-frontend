import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {YesNoDialogComponent} from "./yes-no-dialog.component";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {ModelerModule} from "../../../modeler/modeler.module";

describe("YesNoDialogComponent", () => {
  let component: YesNoDialogComponent;
  let fixture: ComponentFixture<YesNoDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModelerModule
      ],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YesNoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
