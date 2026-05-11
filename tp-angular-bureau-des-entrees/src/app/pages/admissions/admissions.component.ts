import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { AppointmentHistoryService } from '../../services/appointment-history.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-admissions',
  standalone: true,
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    DatePipe
  ]
})
export class AdmissionsComponent implements OnInit {
  appointments: Appointment[] = [];
  displayedColumns: string[] = [
    'heure', 'patient', 'identite', 'ipp', 'service', 'motif', 'agent', 'action'
  ];
  today: Date = new Date();

  constructor(private appointmentHistoryService: AppointmentHistoryService) {}

  ngOnInit() {
    this.appointmentHistoryService.getTodayHistory().subscribe((rdvs) => {
      this.appointments = rdvs;
    });
  }
}
