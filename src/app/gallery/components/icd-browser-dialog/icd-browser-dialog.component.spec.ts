import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import {IcdBrowserDialogComponent} from "./icd-browser-dialog.component";
import {MatDialogRef} from "@angular/material/dialog";

describe("IcdBrowserDialogComponent", () => {
  let component: IcdBrowserDialogComponent;
  let fixture: ComponentFixture<IcdBrowserDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IcdBrowserDialogComponent],
      providers: [
        {
          provide: MatDialogRef, useValue: {
            close: () => {
            }
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcdBrowserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
