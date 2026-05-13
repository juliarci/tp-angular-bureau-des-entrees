import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BureauEntreesPatient } from '../models/patient.model';
import {Observable} from 'rxjs';
import {Patient} from 'fhir/r4';
import {Bundle} from 'fhir/r2';
import {map} from 'rxjs/operators';

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

  searchPatients(criteria: { name?: string; identifier?: string; birthdate?: string }): Observable<Patient[]> {
    let params = new HttpParams();

    if (criteria.name) {
      params = params.set('name', criteria.name);
    }
    if (criteria.identifier) {
      params = params.set('identifier', criteria.identifier);
    }
    if (criteria.birthdate) {
      params = params.set('birthdate', criteria.birthdate);
    }

    return this.http.get<Bundle>(`${this.apiUrl}`, { params }).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter(e => (e.resource as any)?.resourceType === 'Patient')
          .map(e => e.resource as Patient);
      })
    );
  }
}
