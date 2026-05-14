import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Patient, Bundle } from 'fhir/r4';
import { BureauEntreesPatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}

  /**
   * Récupère un seul patient par IPP
   */
  getPatient(IppIdentifier: string): Observable<Patient[]> {
    return this.http.get<Bundle>(`${this.apiUrl}/Patient?identifier=${IppIdentifier}`).pipe(
      map(bundle => {
        console.log('Bundle reçu :', bundle);
        if (!bundle.entry) return [];
        return bundle.entry
          .map((e: any) => e.resource as Patient);
      })
    );
  }

  /**
   * Crée un nouveau patient dans la BDD FHIR
   */
  createPatient(patient: BureauEntreesPatient): Observable<BureauEntreesPatient> {
    return this.http.post<BureauEntreesPatient>(`${this.apiUrl}/Patient`, patient);
  }

  /**
   * Recherche des patients selon des critères
   */
  searchPatients(criteria: {
    name?: string;
    identifier?: string;
    birthdate?: string;
  }): Observable<Patient[]> {
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

    return this.http.get<Bundle>(`${this.apiUrl}/Patient`, { params }).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter((e: any) => (e.resource as any)?.resourceType === 'Patient')
          .map((e: any) => e.resource as Patient);
      })
    );
  }
}
