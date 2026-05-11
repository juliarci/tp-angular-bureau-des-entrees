import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { BureauEntreesPatient, Gender, Nationality } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: BureauEntreesPatient[] = [];
  private patientsSubject = new BehaviorSubject<BureauEntreesPatient[]>(this.patients);
  public patients$ = this.patientsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialise les données de test
   */
  private initializeMockData(): void {
    const mockPatients: BureauEntreesPatient[] = [
      {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'https://chu-ISIS.fr/fhir/sid/ipp',
            value: '0420998122',
            type: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }]
            }
          }
        ],
        name: [
          {
            use: 'official',
            family: 'BERNARD',
            given: ['Camille Sophie']
          }
        ],
        birthDate: '1993-04-12',
        gender: Gender.Female,
        telecom: [
          {
            system: 'phone',
            value: '01 23 45 67 89',
            use: 'home'
          },
          {
            system: 'email',
            value: 'camille.bernard@example.com',
            use: 'work'
          }
        ],
        address: [
          {
            use: 'home',
            line: ['123 Rue de Paris'],
            city: 'Lyon',
            postalCode: '69000',
            country: 'France'
          }
        ],
        contact: [
          {
            relationship: [{ text: 'Épouse' }],
            name: { text: 'Marie Bernard' },
            telecom: [{ system: 'phone', value: '06 12 34 56 78' }]
          }
        ],
        extension: [
          {
            url: 'https://example.org/fhir/StructureDefinition/PatientExtension',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'https://example.org/fhir/CodeSystem/CSAllNationalities',
                  code: Nationality.FR,
                  display: 'Française'
                }
              ]
            }
          }
        ],
        generalPractitioner: [
          {
            reference: 'Practitioner/123'
          }
        ]
      }
    ];

    this.patients = mockPatients;
    this.patientsSubject.next(this.patients);
  }

  /**
   * Crée un nouveau patient
   */
  createPatient(patient: BureauEntreesPatient): Observable<BureauEntreesPatient> {
    return of(patient).pipe(
      delay(500),
      map(newPatient => {
        const patientWithId = { ...newPatient };
        this.patients.push(patientWithId);
        this.patientsSubject.next([...this.patients]);
        console.log('Patient créé avec succès:', patientWithId);
        return patientWithId;
      })
    );
  }

  /**
   * Récupère un patient par son IPP
   */
  getPatientByIPP(ipp: string): Observable<BureauEntreesPatient | undefined> {
    return of(
      this.patients.find(p =>
        p.identifier.some(id => id.value === ipp)
      )
    ).pipe(delay(300));
  }

  /**
   * Récupère un patient par son INS
   */
  getPatientByINS(ins: string): Observable<BureauEntreesPatient | undefined> {
    return of(
      this.patients.find(p =>
        p.identifier.some(id => id.value === ins && id.system === 'urn:oid:1.2.250.1.213.1.4.8')
      )
    ).pipe(delay(300));
  }

  /**
   * Récupère tous les patients
   */
  getAllPatients(): Observable<BureauEntreesPatient[]> {
    return of(this.patients).pipe(delay(300));
  }

  /**
   * Recherche les patients par critères (nom, prénom, date de naissance)
   */
  searchPatients(searchTerm: string): Observable<BureauEntreesPatient[]> {
    const term = searchTerm.toLowerCase();
    return of(
      this.patients.filter(p => {
        // Recherche dans les noms
        const nameMatch = p.name.some(n =>
          (n.family && n.family.toLowerCase().includes(term)) ||
          (n.given && n.given.some(g => g.toLowerCase().includes(term)))
        );

        // Recherche dans les identifiants
        const idMatch = p.identifier.some(id => id.value.toLowerCase().includes(term));

        // Recherche dans la date de naissance
        const dateMatch = p.birthDate && p.birthDate.includes(term);

        return nameMatch || idMatch || dateMatch;
      })
    ).pipe(delay(300));
  }

  /**
   * Met à jour un patient existant
   */
  updatePatient(ipp: string, patientData: Partial<BureauEntreesPatient>): Observable<BureauEntreesPatient | null> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const index = this.patients.findIndex(p =>
          p.identifier.some(id => id.value === ipp)
        );

        if (index === -1) {
          console.error('Patient non trouvé');
          return null;
        }

        const updatedPatient = { ...this.patients[index], ...patientData };
        this.patients[index] = updatedPatient;
        this.patientsSubject.next([...this.patients]);
        console.log('Patient mis à jour:', updatedPatient);
        return updatedPatient;
      })
    );
  }

  /**
   * Archive/désactive un patient
   */
  archivePatient(ipp: string): Observable<boolean> {
    return of(false).pipe(
      delay(300),
      map(() => {
        const index = this.patients.findIndex(p =>
          p.identifier.some(id => id.value === ipp)
        );

        if (index === -1) {
          console.error('Patient non trouvé');
          return false;
        }

        // Ajouter un flag de désactivation (simulation de l'état "archived")
        const patient = this.patients[index];
        const archivedPatient = { ...patient, active: false } as any;
        this.patients[index] = archivedPatient;
        this.patientsSubject.next([...this.patients]);
        console.log('Patient archivé:', ipp);
        return true;
      })
    );
  }

  /**
   * Vérifie si un doublon patient existe par critères démographiques
   */
  checkForDuplicates(patient: BureauEntreesPatient): Observable<BureauEntreesPatient[]> {
    return of(
      this.patients.filter(p => {
        // Même date de naissance
        if (p.birthDate === patient.birthDate) {
          // Même nom de famille
          const sameFamily = p.name.some(pn =>
            patient.name.some(patientName =>
              pn.family?.toLowerCase() === patientName.family?.toLowerCase()
            )
          );

          // Même genre
          const sameGender = p.gender === patient.gender;

          return sameFamily && sameGender;
        }

        return false;
      })
    ).pipe(delay(300));
  }

  /**
   * Récupère les patients du jour (simulation)
   */
  getTodayAdmissions(): Observable<BureauEntreesPatient[]> {
    // Retourner tous les patients pour la simulation
    return of(this.patients).pipe(
      delay(300),
      map(patients => patients.slice(0, Math.ceil(patients.length / 2)))
    );
  }

  /**
   * Obtient le statut de qualification INS d'un patient
   */
  getINSStatus(patientId: string): Observable<'qualified' | 'provisional' | 'unknown'> {
    return of(null).pipe(
      delay(200),
      map(() => {
        const patient = this.patients.find(p =>
          p.identifier.some(id => id.value === patientId)
        );

        if (!patient) {
          return 'unknown';
        }

        // Vérifier si le patient a un INS qualifié
        const hasQualifiedINS = patient.identifier.some(id =>
          id.system === 'urn:oid:1.2.250.1.213.1.4.8' && id.value
        );

        if (hasQualifiedINS) {
          return 'qualified';
        }

        // Vérifier si le patient a un INS provisoire (sans système spécifique)
        const hasProvisionalINS = patient.identifier.length > 0;

        return hasProvisionalINS ? 'provisional' : 'unknown';
      })
    );
  }

  /**
   * Récupère les alertes d'identité pour un patient
   */
  getIdentityAlerts(ipp: string): Observable<string[]> {
    const patient = this.patients.find(p =>
      p.identifier.some(id => id.value === ipp)
    );

    if (!patient) {
      return of(['Patient non trouvé']);
    }

    const alerts: string[] = [];

    // Vérifier les champs obligatoires manquants
    if (!patient.name || patient.name.length === 0) {
      alerts.push('Nom du patient manquant');
    }

    if (!patient.birthDate) {
      alerts.push('Date de naissance manquante');
    }

    if (!patient.gender) {
      alerts.push('Genre administratif manquant');
    }

    // Vérifier INS
    const hasINS = patient.identifier.some(id =>
      id.system === 'urn:oid:1.2.250.1.213.1.4.8'
    );
    if (!hasINS) {
      alerts.push('Pas d\'INS fourni (provisoire)');
    }

    return of(alerts).pipe(delay(200));
  }

  /**
   * Exporte un patient au format FHIR JSON
   */
  exportPatientAsJSON(ipp: string): Observable<string> {
    const patient = this.patients.find(p =>
      p.identifier.some(id => id.value === ipp)
    );

    if (!patient) {
      return of('');
    }

    return of(JSON.stringify(patient, null, 2)).pipe(delay(200));
  }
}
