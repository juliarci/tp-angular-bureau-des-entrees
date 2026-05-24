import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface AddressResult {
  postalCode: string;
  city: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'https://api-adresse.data.gouv.fr/search';

  constructor(private http: HttpClient) {}

  /**
   * Recherche une adresse par code postal
   * Retourne les villes correspondantes
   */
  searchByPostalCode(postalCode: string): Observable<AddressResult[]> {
    if (!postalCode || postalCode.length < 2) {
      return of([]);
    }

    console.log(`API: Recherche par code postal: ${postalCode}`);
    return this.http.get<any>(`${this.apiUrl}?postcode=${postalCode}&limit=10`).pipe(
      map(response => {
        console.log(`API réponse pour code postal ${postalCode}:`, response);
        const results: { [key: string]: AddressResult } = {};

        if (response.features && Array.isArray(response.features)) {
          response.features.forEach((feature: any) => {
            const properties = feature.properties;
            if (properties.postcode && properties.city) {
              const key = `${properties.postcode}-${properties.city}`;
              if (!results[key]) {
                results[key] = {
                  postalCode: properties.postcode,
                  city: properties.city,
                  country: 'France'
                };
              }
            }
          });
        }

        const filtered = Object.values(results).slice(0, 10);
        console.log(`Résultats filtrés pour ${postalCode}:`, filtered);
        return filtered;
      }),
      catchError(error => {
        console.error('Erreur API code postal:', error);
        return of([]);
      })
    );
  }

  /**
   * Recherche une adresse par nom de ville
   * Retourne les codes postaux correspondants
   */
  searchByCity(city: string): Observable<AddressResult[]> {
    if (!city || city.length < 2) {
      return of([]);
    }

    console.log(`API: Recherche par ville: ${city}`);
    return this.http.get<any>(`${this.apiUrl}?q=${city}&limit=10&type=municipality`).pipe(
      map(response => {
        console.log(`API réponse pour ville ${city}:`, response);
        const results: { [key: string]: AddressResult } = {};

        if (response.features && Array.isArray(response.features)) {
          response.features.forEach((feature: any) => {
            const properties = feature.properties;
            if (properties.postcode && properties.city) {
              const key = `${properties.postcode}-${properties.city}`;
              if (!results[key]) {
                results[key] = {
                  postalCode: properties.postcode,
                  city: properties.city,
                  country: 'France'
                };
              }
            }
          });
        }

        const filtered = Object.values(results).slice(0, 10);
        console.log(`Résultats filtrés pour ${city}:`, filtered);
        return filtered;
      }),
      catchError(error => {
        console.error('Erreur API ville:', error);
        return of([]);
      })
    );
  }
}

