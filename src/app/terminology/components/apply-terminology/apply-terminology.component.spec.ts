import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyTerminologyComponent } from './apply-terminology.component';

describe('ApplyTerminologyComponent', () => {
  let component: ApplyTerminologyComponent;
  let fixture: ComponentFixture<ApplyTerminologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplyTerminologyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyTerminologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
