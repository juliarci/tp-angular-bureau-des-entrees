import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentHistoryService } from '../../services/appointment-history.service';
import { Appointment, getParticipantByType } from '../../models/appointment.model';

registerLocaleData(localeFr);

@Component({
  selector: 'app-admissions',
  standalone: true,
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    DatePipe
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class AdmissionsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  displayedColumns = ['heure', 'patient', 'identite', 'service', 'motif', 'statut', 'agent', 'action'];

  today: Date = new Date();

  readonly statusLabel: Record<string, string> = {
    proposed:  'Proposé',
    pending:   'En attente',
    booked:    'Attendu',
    arrived:   'Arrivé',
    fulfilled: 'Hospitalisé',
    cancelled: 'Annulé',
    noshow:    'Absent',
  };

  // Filtres
  selectedService = '';
  selectedAgent = '';
  selectedStatus = '';
  searchText = '';

  // Options de filtres (générées dynamiquement)
  services: string[] = [];
  agents: string[] = [];
  statuses: string[] = [];

  constructor(
    private appointmentHistoryService: AppointmentHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentHistoryService.getTodayHistory().subscribe((appointments) => {
      this.appointments = appointments;
      this.extractFilterOptions();
      this.applyFilters();
    });
  }

  /**
   * Extrait les valeurs uniques pour les filtres
   */
  private extractFilterOptions(): void {
    // Extraire les services uniques
    this.services = [...new Set(
      this.appointments
        .map(a => a.description)
        .filter((v) => v !== undefined && v !== null)
    )].sort();

    // Extraire les agents uniques (Practitioner)
    this.agents = [...new Set(
      this.appointments
        .flatMap(a => a.participant || [])
        .filter(p => p.actor?.type === 'Practitioner')
        .map(p => p.actor?.display)
        .filter((v) => v !== undefined && v !== null)
    )].sort();

    // Extraire les statuts uniques
    this.statuses = [...new Set(
      this.appointments
        .map(a => a.status)
        .filter((v) => v !== undefined && v !== null)
    )].sort();
  }

  /**
   * Récupère le patient d'un rendez-vous
   */
  getPatient(appointment: Appointment) {
    return getParticipantByType(appointment.participant, 'Patient');
  }

  /**
   * Récupère l'étiquette française du statut
   */
  getStatusLabel(status: string): string {
    return this.statusLabel[status] || status;
  }

  /**
   * Réinitialise tous les filtres
   */
  clearFilters(): void {
    this.selectedService = '';
    this.selectedAgent = '';
    this.selectedStatus = '';
    this.searchText = '';
    this.applyFilters();
  }

  /**
   * Applique les filtres aux rendez-vous
   */
  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchStatus = !this.selectedStatus || appointment.status === this.selectedStatus;
      const matchService = !this.selectedService || appointment.description === this.selectedService;
      const matchAgent = !this.selectedAgent ||
        appointment.participant?.some(p => p.actor?.type === 'Practitioner' && p.actor?.display === this.selectedAgent);
      const matchSearch = !this.searchText ||
        this.getPatient(appointment)?.display?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        appointment.description?.toLowerCase().includes(this.searchText.toLowerCase());

      return matchStatus && matchService && matchAgent && matchSearch;
    });
  }

  /**
   * Navigue vers le dossier patient
   */
  goToPatientRecord(appointment: Appointment): void {
    const patient = this.getPatient(appointment);
    const ipp = patient?.identifier?.value;

    if (ipp) {
      this.router.navigate(['/patients/record', ipp]);
    } else {
      this.router.navigate(['/patients/record']);
    }
  }
}
