import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCodeSystemConceptComponent } from './add-edit-code-system-concept.component';

describe('AddEditCodeSystemComponent', () => {
  let component: AddEditCodeSystemConceptComponent;
  let fixture: ComponentFixture<AddEditCodeSystemConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditCodeSystemConceptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCodeSystemConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
