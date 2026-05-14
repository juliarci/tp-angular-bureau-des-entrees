import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PractitionerService {
  private apiUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) {}

  // Récupère un médecin par ID
  getPractitioner(practitionerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Practitioner/${practitionerId}`);
  }
}
