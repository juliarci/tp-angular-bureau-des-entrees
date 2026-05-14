import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bundle, Practitioner } from 'fhir/r4';  // ← tout depuis fhir/r4, pas fhir/r2
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PractitionerService {

  private apiUrl = `${environment.apiUrl}/Practitioner`;  // ← une seule apiUrl

  constructor(private http: HttpClient) {}

  // Récupère un médecin par son ID
  getPractitioner(practitionerId: string): Observable<Practitioner> {
    return this.http.get<Practitioner>(`${this.apiUrl}/${practitionerId}`);
  }

  // Récupère tous les médecins
  getAllPractitioners(): Observable<Practitioner[]> {
    return this.http.get<Bundle>(this.apiUrl).pipe(
      map(bundle => {
        if (!bundle.entry) return [];
        return bundle.entry
          .filter((e): e is { resource: Practitioner } =>
            e.resource !== undefined && e.resource.resourceType === 'Practitioner'
          )
          .map(e => e.resource);
      })
    );
  }
}
