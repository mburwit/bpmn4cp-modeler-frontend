import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCodeSystemComponent } from './add-edit-code-system.component';

describe('AddEditCodeSystemComponent', () => {
  let component: AddEditCodeSystemComponent;
  let fixture: ComponentFixture<AddEditCodeSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditCodeSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCodeSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
