import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Appointment} from 'fhir/r2';

@Injectable({
  providedIn: 'root'
})
export class AppointmentHistoryService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}


  getHistoryByPatient(patientId: number) {
    return this.http.get<Appointment[]>(`${this.apiUrl}?patientId=${patientId}`);
  }
}
