import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData, DatePipe } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

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
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class AdmissionsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

displayedColumns = [ 'heure', 'patient', 'identite', 'service', 'motif', 'statut', 'agent', 'action'];

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

  selectedService = '';
  selectedAgent = '';
  selectedStatus = ''; 
  searchText = '';

  readonly statusTabs: { label: string; value: string; colorClass: string }[] = [
    { label: 'Tous',         value: '',          colorClass: '' },
    { label: 'Attendus',     value: 'booked',    colorClass: 'tab-orange' },
    { label: 'Arrivés',      value: 'arrived',   colorClass: 'tab-green' },
    { label: 'Hospitalisés', value: 'fulfilled', colorClass: 'tab-blue' },
    { label: 'Annulés',      value: 'cancelled', colorClass: 'tab-red' },
  ];

  get activeFilterChips(): { label: string; key: string }[] {
    const chips: { label: string; key: string }[] = [];
    if (this.selectedService) chips.push({ label: `Service : ${this.selectedService}`, key: 'service' });
    if (this.selectedAgent)   chips.push({ label: `Agent : ${this.selectedAgent}`,     key: 'agent' });
    return chips;
  }

  get countByStatus(): Record<string, number> {
    return this.appointments.reduce((acc, a) => {
      const s = a.status ?? 'unknown';
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  get totalCount(): number {
    return this.appointments.length;
  }

  constructor(private appointmentHistoryService: AppointmentHistoryService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.appointmentHistoryService.getTodayHistory().subscribe((rdvs) => {
      this.appointments = rdvs;
      this.cd.detectChanges();
      this.applyFilters();
    });
  }

  getPatient(appointment: Appointment) {
    return getParticipantByType(appointment.participant, 'Patient');
  }

  getPractitioner(appointment: Appointment) {
    return getParticipantByType(appointment.participant, 'Practitioner');
  }

  getLocation(appointment: Appointment) {
    return getParticipantByType(appointment.participant, 'Location');
  }

  get patient() {
    return (appointment: Appointment) => getParticipantByType(appointment.participant, 'Patient');
  }

  selectStatus(value: string): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  removeChip(key: string): void {
    if (key === 'service') this.selectedService = '';
    if (key === 'agent')   this.selectedAgent = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedService = '';
    this.selectedAgent = '';
    this.selectedStatus = '';
    this.searchText = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(a => {
      const matchStatus  = !this.selectedStatus  || a.status === this.selectedStatus;
      const matchSearch  = !this.searchText      ||
        this.getPatient(a)?.display?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        a.description?.toLowerCase().includes(this.searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  statusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      booked:    'statut-attendu',
      arrived:   'statut-arrive',
      fulfilled: 'statut-hospitalise',
      cancelled: 'statut-annule',
      noshow:    'statut-annule',
    };
    return map[status ?? ''] ?? '';
  }

  actionLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      booked:    'Admettre',
      arrived:   'Vers service',
      fulfilled: 'Sortie',
    };
    return map[status ?? ''] ?? 'Action';
  }

  goToPatientRecord(appointment: Appointment) {
    const patient = this.getPatient(appointment);
    if (patient && patient.identifier && patient.identifier.value) {
      // Passage de l'IPP en paramètre de navigation
      window.location.href = `/patients/record?ipp=${patient.identifier.value}`;
    } else {
      window.location.href = '/patients/record';
    }
  }
}
