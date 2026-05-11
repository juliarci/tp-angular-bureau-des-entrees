import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Appointment} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentHistoryService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}


  getHistoryByPatient(patientId: number) {
    return this.http.get<Appointment[]>(`${this.apiUrl}?patientId=${patientId}`);
  }

  getHistoryByDateRange(startDate: string, endDate: string) {
    return this.http.get<Appointment[]>(`${this.apiUrl}?startDate=${startDate}&endDate=${endDate}`);
  }

  getTodayHistory() {
    const today = new Date().toISOString().slice(0, 10); 
    return this.getHistoryByDateRange(today, today);
  }
}
