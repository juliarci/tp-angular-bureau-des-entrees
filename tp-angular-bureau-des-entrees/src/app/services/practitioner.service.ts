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

  constructor(private http: HttpClient) {}

  }
}
