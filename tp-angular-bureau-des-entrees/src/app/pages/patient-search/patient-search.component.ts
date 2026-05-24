import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { Patient } from 'fhir/r4';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent {
  name = '';
  identifier = '';
  birthdate: Date | null = null;

  patients: Patient[] = [];
  loading = false;
  searched = false;

  displayedColumns = ['name', 'birthDate', 'gender', 'identifier'];

  constructor(private patientService: PatientService) {}

  search() {
    if (!this.name && !this.identifier && !this.birthdate) return;

    this.loading = true;
    this.searched = true;

    const birthdateStr = this.birthdate
      ? this.birthdate.toISOString().split('T')[0]
      : undefined;

    this.patientService.searchPatients({
      name: this.name || undefined,
      identifier: this.identifier || undefined,
      birthdate: birthdateStr
    }).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
      },
      error: () => {
        this.patients = [];
        this.loading = false;
      }
    });
  }

  getPatientName(patient: Patient): string {
    const name = patient.name?.[0];
    if (!name) return 'Inconnu';
    return `${name.family ?? ''} ${(name.given ?? []).join(' ')}`.trim();
  }

  getPatientIdentifier(patient: Patient): string {
    const ipp = patient.identifier?.find(id => id.type?.coding?.[0]?.code === 'MR');
    if (ipp) return `IPP: ${ipp.value}`;
    return patient.identifier?.[0]?.value ?? '-';
  }
}
