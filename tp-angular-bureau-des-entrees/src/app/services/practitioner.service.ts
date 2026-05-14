import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Practitioner} from 'fhir/r4';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Bundle} from 'fhir/r2';

@Injectable({
  providedIn: 'root'
})
export class PractitionerService {
  private apiUrl = `${environment.apiUrl}/Practitioner`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les médecins dans la BDD FHIR
   */
  getPractitioners(): Observable<Practitioner[]> {
    return this.http.get<Bundle>(this.apiUrl).pipe(map(bundle => {
      if (!bundle.entry) return [];
      return bundle.entry
        .filter(e => (e.resource as any)?.resourceType === 'Practitioner')
        .map(e => e.resource as Practitioner);
    }));
  }
}
