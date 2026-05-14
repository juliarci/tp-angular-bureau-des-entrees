import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bundle, Practitioner } from 'fhir/r4';

@Injectable({
  providedIn: 'root'
})
export class PractitionerService {

  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}

  // Récupère un médecin par son ID
  getPractitioner(practitionerId: string): Observable<Practitioner> {
    return this.http.get<Practitioner>(`${this.apiUrl}/Practitioner/${practitionerId}`);
  }

  // Récupère tous les médecins
  getAllPractitioners(): Observable<Practitioner[]> {
    return this.http.get<Bundle>(`${this.apiUrl}/Practitioner`).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter((e: any) => (e.resource as any)?.resourceType === 'Practitioner')
          .map((e: any) => e.resource as Practitioner);
      })
    );
  }
}
