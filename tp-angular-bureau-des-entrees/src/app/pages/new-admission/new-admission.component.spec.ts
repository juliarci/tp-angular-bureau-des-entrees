import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewAdmissionComponent } from './new-admission.component';

describe('NewAdmissionComponent', () => {
  let component: NewAdmissionComponent;
  let fixture: ComponentFixture<NewAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAdmissionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
