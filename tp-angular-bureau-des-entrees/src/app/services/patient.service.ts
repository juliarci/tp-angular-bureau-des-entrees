import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BureauEntreesPatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/Patient`;

  constructor(private http: HttpClient) {}

  /**
   * Crée un nouveau patient dans la BDD FHIR
   */
  createPatient(patient: BureauEntreesPatient) {
    return this.http.post<BureauEntreesPatient>(this.apiUrl, patient);
  }
}
