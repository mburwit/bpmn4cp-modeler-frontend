import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSystemConceptListComponent } from './code-system-concept-list.component';

describe('CodeSystemConceptListComponent', () => {
  let component: CodeSystemConceptListComponent;
  let fixture: ComponentFixture<CodeSystemConceptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeSystemConceptListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSystemConceptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
