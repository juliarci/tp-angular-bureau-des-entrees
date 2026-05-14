import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Appointment} from '../models/appointment.model';
import { Bundle, Patient } from 'fhir/r4';
import { map } from 'rxjs';
import { App } from '../app';

@Injectable({
  providedIn: 'root'
})
export class AppointmentHistoryService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}


  getHistoryByPatient(patientId: number) {
    return this.http.get<Appointment[]>(`${this.apiUrl}/Appointment?patient=${patientId}`);
  }

  getHistoryByDateRange(date: string) {
    return this.http.get<Bundle>(`${this.apiUrl}/Appointment?date=${date}`).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter(e => (e.resource as any)?.resourceType === 'Appointment')
          .map(e => e.resource as Appointment);
      })
    );
  }

  getTodayHistory() {
    const today = new Date().toISOString().slice(0, 10); 
    return this.getHistoryByDateRange(today);
  }
}
