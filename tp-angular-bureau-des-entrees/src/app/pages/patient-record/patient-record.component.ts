import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from 'fhir/r4';
import { PractitionerService } from '../../services/practitioner.service';

@Component({
  selector: 'app-patient-record',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-record.component.html',
  styleUrl: './patient-record.component.scss'
})
export class PatientRecordComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private practitionerService = inject(PractitionerService);

  patient?: Patient;
  practitioner?: any;
  isLoading = true;
  error?: string;
  activeTab = 'synthese';

  readonly tabs = [
    { id: 'synthese', label: 'Synthèse' },
    { id: 'sejours', label: 'Séjours & mouvements' },
    { id: 'couverture', label: 'Couverture & droits' },
    { id: 'documents', label: 'Documents' },
    { id: 'historique', label: 'Historique identitovigilance' },
    { id: 'annexes', label: 'Annexes' }
  ];

  getNationality(): string {
    return this.patient?.extension?.[0]?.valueCodeableConcept?.coding?.[0]?.display ?? '—';
  }

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    const ipp = this.route.snapshot.paramMap.get('IppIdentifier');
    console.log('URL actuelle :', window.location.href);
    console.log('IPP reçu :', ipp)
    if (!ipp) {
      this.error = 'Aucun IPP trouvé dans l\'URL';
      return;
    }

    this.patientService.getPatient(ipp).subscribe({
      next: (patients) => {
        if (patients && patients.length > 0) {
          this.patient = patients[0];

          // Récupérer le médecin traitant si existant
          if (this.patient.generalPractitioner && this.patient.generalPractitioner.length > 0) {
            const practitionerRef = this.patient.generalPractitioner[0]?.reference;

            if (practitionerRef) {  // ← Vérifier que practitionerRef existe
              const practitionerId = practitionerRef.split('/')[1];

              this.practitionerService.getPractitioner(practitionerId).subscribe({
                next: (practitioner) => {
                  this.practitioner = practitioner;
                  this.isLoading = false;
                  this.cd.detectChanges();
                },
                error: (err: any) => {
                  console.error('Impossible de charger le médecin traitant', err);
                  this.isLoading = false;
                  this.cd.detectChanges();
                }
              });
            } else {
              this.isLoading = false;
              this.cd.detectChanges();
            }
          } else {
            this.isLoading = false;
            this.cd.detectChanges();
          }
        } else {
          this.error = 'Aucun patient trouvé';
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (err: any) => {
        this.error = 'Impossible de charger le patient : ' + err.message;
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  getPractitionerName(): string {
    if (!this.practitioner) return '—';

    const text = this.practitioner.name?.[0]?.text;
    if (text) return text;

    const family = this.practitioner.name?.[0]?.family ?? '';
    const given = this.practitioner.name?.[0]?.given?.[0] ?? '';
    const fullName = `${family} ${given}`.trim();

    return fullName || '—';
  }

}

