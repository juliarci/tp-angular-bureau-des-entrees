import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentPatientForm } from './component-patient-form';

describe('ComponentPatientForm', () => {
  let component: ComponentPatientForm;
  let fixture: ComponentFixture<ComponentPatientForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentPatientForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentPatientForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
