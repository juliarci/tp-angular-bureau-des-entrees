import { Component } from '@angular/core';
import {Appointment} from '../../models/appointment.model';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-appointment-history',
  imports: [],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.css',
})
export class AppointmentHistory {
  appointments: Appointment[];

  constructor() {}
}
