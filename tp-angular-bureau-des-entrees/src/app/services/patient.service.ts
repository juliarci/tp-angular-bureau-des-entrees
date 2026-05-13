import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Bundle, Patient } from 'fhir/r4';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}

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

    return this.http.get<Bundle>(`${this.apiUrl}/Patient`, { params }).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter(e => (e.resource as any)?.resourceType === 'Patient')
          .map(e => e.resource as Patient);
      })
    );
  }
}
