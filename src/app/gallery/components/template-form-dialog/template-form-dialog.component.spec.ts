import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {TemplateFormDialogComponent} from "./template-form-dialog.component";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Template} from "../../../shared/fhir/extensions/bpmn-xml-extension";
import {SharedModule} from "../../../shared/shared.module";

describe("TemplateFormDialogComponent", () => {
  let component: TemplateFormDialogComponent;
  let fixture: ComponentFixture<TemplateFormDialogComponent>;
  const templateStub = new Template(1234, "title", "title", "description", btoa("bpmnXmlBase64"), btoa("svgBase64"));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [TemplateFormDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: templateStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
