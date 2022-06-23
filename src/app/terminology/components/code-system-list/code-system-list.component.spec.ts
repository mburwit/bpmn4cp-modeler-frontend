import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSystemListComponent } from './code-system-list.component';

describe('CodeSystemListComponent', () => {
  let component: CodeSystemListComponent;
  let fixture: ComponentFixture<CodeSystemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeSystemListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSystemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
