import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSystemComponent } from './code-system.component';

describe('TerminologyComponent', () => {
  let component: CodeSystemComponent;
  let fixture: ComponentFixture<CodeSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
