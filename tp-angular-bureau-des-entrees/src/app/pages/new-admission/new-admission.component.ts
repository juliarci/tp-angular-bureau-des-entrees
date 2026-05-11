import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BureauEntreesPatient, Nationality, NationalityDisplay } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-new-admission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './new-admission.component.html',
  styleUrl: './new-admission.component.scss'
})
export class NewAdmissionComponent implements OnInit {
  patientForm: FormGroup;
  nationalityOptions = Object.entries(NationalityDisplay).map(([code, display]) => ({ code, display }));
  isLoading = false;
  formSubmitted = false;
  currentStep = 1;
  totalSteps = 6;

  steps = [
    { number: 1, label: 'Identifiants', icon: 'badge' },
    { number: 2, label: 'Identité INS', icon: 'person' },
    { number: 3, label: 'Admission', icon: 'assignment' },
    { number: 4, label: 'Couverture & PEC', icon: 'description' },
    { number: 5, label: 'Contacts & confidentialité', icon: 'phone' },
    { number: 6, label: 'Récapitulatif & signature', icon: 'done_all' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.initializeForm();
  }

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      // Identifiants (IPP obligatoire, INS optionnel)
      ipp: ['', [Validators.required]],
      ins: [''],

      // Noms (au moins 1, potentiellement plusieurs)
      names: this.fb.array([
        this.createNameGroup()
      ]),

      // Données démographiques obligatoires
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],

      // Contacts (téléphone, email)
      telecoms: this.fb.array([]),

      // Adresse
      addresses: this.fb.array([]),

      // Personne de confiance
      emergencyContact: this.fb.group({
        name: [''],
        relationship: [''],
        phone: ['']
      }),

      // Nationalité
      nationality: [''],

      // Médecin traitant
      generalPractitioner: ['']
    });
  }

  private createNameGroup(): FormGroup {
    return this.fb.group({
      use: ['usual'],
      given: ['', [Validators.required]],
      family: ['', [Validators.required]],
      prefix: [''],
      suffix: ['']
    });
  }

  private createTelecomGroup(): FormGroup {
    return this.fb.group({
      system: ['', [Validators.required]],
      value: ['', [Validators.required]],
      use: ['']
    });
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      use: ['home'],
      line: [''],
      city: [''],
      postalCode: [''],
      country: ['']
    });
  }

  get namesArray(): FormArray {
    return this.patientForm.get('names') as FormArray;
  }

  get telecomsArray(): FormArray {
    return this.patientForm.get('telecoms') as FormArray;
  }

  get addressesArray(): FormArray {
    return this.patientForm.get('addresses') as FormArray;
  }

  get emergencyContactForm(): FormGroup {
    return this.patientForm.get('emergencyContact') as FormGroup;
  }

  addName(): void {
    this.namesArray.push(this.createNameGroup());
  }

  removeName(index: number): void {
    if (this.namesArray.length > 1) {
      this.namesArray.removeAt(index);
    }
  }

  addTelecom(): void {
    this.telecomsArray.push(this.createTelecomGroup());
  }

  removeTelecom(index: number): void {
    this.telecomsArray.removeAt(index);
  }

  addAddress(): void {
    this.addressesArray.push(this.createAddressGroup());
  }

  removeAddress(index: number): void {
    this.addressesArray.removeAt(index);
  }

  submitForm(): void {
    this.formSubmitted = true;

    if (this.patientForm.valid) {
      this.isLoading = true;
      const formValue = this.patientForm.value;
      const patientData: BureauEntreesPatient = this.buildPatientObject(formValue);

      this.patientService.createPatient(patientData).subscribe({
        next: (createdPatient) => {
          this.isLoading = false;
          this.snackBar.open(
            `✓ Patient créé avec succès - IPP: ${createdPatient.identifier[0].value}`,
            'Fermer',
            { duration: 5000, horizontalPosition: 'end' }
          );
          this.resetForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            `✗ Erreur lors de la création du patient: ${error}`,
            'Fermer',
            { duration: 5000, horizontalPosition: 'end', panelClass: ['error-snackbar'] }
          );
          console.error('Erreur:', error);
        }
      });
    } else {
      this.snackBar.open(
        '⚠ Veuillez remplir tous les champs obligatoires',
        'Fermer',
        { duration: 3000, horizontalPosition: 'end' }
      );
      this.markFormGroupTouched(this.patientForm);
    }
  }

  private buildPatientObject(formValue: any): BureauEntreesPatient {
    const identifiers = [];

    // IPP (obligatoire)
    identifiers.push({
      system: 'https://chu-ISIS.fr/fhir/sid/ipp',
      value: formValue.ipp,
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          code: 'MR'
        }]
      }
    });

    // INS (optionnel)
    if (formValue.ins) {
      identifiers.push({
        system: 'urn:oid:1.2.250.1.213.1.4.8',
        value: formValue.ins,
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'NI'
          }]
        }
      });
    }

    return {
      resourceType: 'Patient',
      identifier: identifiers as any,
      name: formValue.names.map((name: any) => ({
        use: name.use,
        family: name.family,
        given: name.given ? [name.given] : undefined,
        prefix: name.prefix ? [name.prefix] : undefined,
        suffix: name.suffix ? [name.suffix] : undefined
      })),
      birthDate: formValue.birthDate,
      gender: formValue.gender,
      telecom: formValue.telecoms.length > 0 ? formValue.telecoms : undefined,
      address: formValue.addresses.length > 0 ? formValue.addresses : undefined,
      contact: this.buildContactArray(formValue.emergencyContact),
      extension: formValue.nationality ? [{
        url: 'https://example.org/fhir/StructureDefinition/PatientExtension',
        valueCodeableConcept: {
          coding: [{
            system: 'https://example.org/fhir/CodeSystem/CSAllNationalities',
            code: formValue.nationality,
            display: NationalityDisplay[formValue.nationality as Nationality]
          }]
        }
      }] : undefined,
      generalPractitioner: formValue.generalPractitioner ? [{
        reference: formValue.generalPractitioner
      }] : undefined
    } as BureauEntreesPatient;
  }

  private buildContactArray(emergencyContact: any): any[] | undefined {
    if (emergencyContact.name || emergencyContact.phone) {
      return [{
        name: {
          text: emergencyContact.name
        },
        relationship: emergencyContact.relationship ? [{
          text: emergencyContact.relationship
        }] : undefined,
        telecom: emergencyContact.phone ? [{
          system: 'phone',
          value: emergencyContact.phone
        }] : undefined
      }];
    }
    return undefined;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          }
        });
      }
    });
  }

  resetForm(): void {
    this.patientForm.reset();
    this.namesArray.clear();
    this.namesArray.push(this.createNameGroup());
    this.telecomsArray.clear();
    this.addressesArray.clear();
    this.formSubmitted = false;
    this.currentStep = 1;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    if (step > 0 && step <= this.totalSteps) {
      this.currentStep = step;
      this.scrollToTop();
    }
  }

  isStepComplete(step: number): boolean {
    switch(step) {
      case 1:
        return this.patientForm.get('ipp')?.valid ?? false;
      case 2:
        return (this.patientForm.get('names') as FormArray).at(0)?.valid ?? false;
      case 3:
        return (this.patientForm.get('birthDate')?.valid ?? false) && (this.patientForm.get('gender')?.valid ?? false);
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return this.patientForm.valid;
      default:
        return false;
    }
  }

  getCompletionPercentage(): number {
    let completed = 0;
    const requiredFields = [
      this.patientForm.get('ipp')?.valid,
      (this.namesArray.at(0))?.valid,
      this.patientForm.get('birthDate')?.valid,
      this.patientForm.get('gender')?.valid
    ];
    completed = requiredFields.filter(f => f).length;
    return Math.round((completed / requiredFields.length) * 100);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
