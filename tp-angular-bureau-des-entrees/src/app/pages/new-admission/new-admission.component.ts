import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BureauEntreesPatient, Nationality, NationalityDisplay } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AddressService, AddressResult } from '../../services/address.service';
import {PractitionerService} from '../../services/practitioner.service';

@Component({
  selector: 'app-new-admission',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  templateUrl: './new-admission.component.html',
  styleUrl: './new-admission.component.scss'
})
export class NewAdmissionComponent implements OnInit {
  patientForm: FormGroup;
  nationalityOptions = Object.entries(NationalityDisplay).map(([code, display]) => ({ code, display }));
  practitionerOptions: Array<{ id: string | undefined ; label: string | undefined}> = [];
  isLoading = false;
  formSubmitted = false;
  currentStep = 1;
  totalSteps = 6;

  // Listes de sélection
  prefixOptions = ['Dr.', 'Me.', 'M.', 'Mme.', 'Mlle.', 'Prof.', 'Me', ''];
  suffixOptions = ['Jr.', 'Sr.', 'III', 'II', 'IV', ''];

  // Compteurs pour l'affichage de la taille des champs
  ippCharCount = 0;

  // Gestion du médecin traitant personnalisé
  customPractitionerMode = false;

  // Suggestions d'adresses (une par index d'adresse)
  addressSuggestions: { [key: number]: AddressResult[] } = {};

  // Expose Math pour l'utiliser dans le template
  Math = Math;
  insCharCount = 0;

  steps = [
    { number: 1, label: 'Identifiants', icon: 'badge' },
    { number: 2, label: 'Identité INS', icon: 'person' },
    { number: 3, label: 'Admission', icon: 'assignment' },
    { number: 4, label: 'Couverture & PEC', icon: 'description' },
    { number: 5, label: 'Contacts & confidentialité', icon: 'phone' },
    { number: 6, label: 'Récapitulatif & envoi', icon: 'done_all' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private practitionerService: PractitionerService,
    private addressService: AddressService,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPractitioners();

    // Initialiser les compteurs
    this.updateIppCharCount();
    this.updateInsCharCount();

    // Subscribe aux changements IPP pour mettre à jour le compteur en temps réel
    this.patientForm.get('ipp')?.valueChanges.subscribe(() => {
      this.updateIppCharCount();
    });

    // Subscribe aux changements INS pour mettre à jour le compteur en temps réel
    this.patientForm.get('ins')?.valueChanges.subscribe(() => {
      this.updateInsCharCount();
    });
  }

  /**
   * Charge la liste des praticiens
   */
  private loadPractitioners(): void {
    this.practitionerService.getPractitioners().subscribe(practitioners => {
      this.practitionerOptions = practitioners.map(pract => {
        const officialName = pract.name?.find(n => n.use === 'official') ?? pract.name?.[0];

        const family = officialName?.family ?? '';
        const given = officialName?.given?.join(' ') ?? '';

        const fullName = `${given} ${family}`.trim();

        return {
          id: `Practitioner/${pract.id}`,
          label: fullName ? `Dr ${fullName}` : 'Médecin sans nom'
        };
      });
    })
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      // Identifiants (IPP obligatoire, INS optionnel)
      ipp: ['', [Validators.required, this.ippValidator.bind(this)]],
      ins: ['', [this.insValidator.bind(this)]],

      // Noms (au moins 1, potentiellement plusieurs)
      names: this.fb.array([
        this.createNameGroup()
      ]),

      // Données démographiques obligatoires
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],

      // Contacts (téléphone, email)
      telecoms: this.fb.array([]),

      // Adresse
      addresses: this.fb.array([]),

      // Personne de confiance
      emergencyContact: this.fb.group({
        name: [''],
        relationship: [''],
        phone: ['']
      }),

      // Nationalité
      nationality: [''],

      // Médecin traitant
      generalPractitioner: ['']
    });
  }

  /**
   * Met à jour le compteur de caractères pour l'IPP
   */
  updateIppCharCount(): void {
    const ippValue = this.patientForm.get('ipp')?.value || '';
    this.ippCharCount = ippValue.toString().replace(/\s/g, '').length;
  }

  /**
   * Filtre les caractères non numériques pour IPP
   */
  filterIppInput(event: any): void {
    const input = event.target;
    const value = input.value;

    // Garde seulement les chiffres
    const filtered = value.replace(/[^\d]/g, '');

    if (value !== filtered) {
      input.value = filtered;
      this.patientForm.get('ipp')?.setValue(filtered, { emitEvent: false });
    }

    // Mise à jour du compteur
    this.updateIppCharCount();
  }

  /**
   * Met à jour le compteur de caractères pour l'INS
   */
  updateInsCharCount(): void {
    const insValue = this.patientForm.get('ins')?.value || '';
    this.insCharCount = insValue.toString().replace(/\s/g, '').length;
  }

  /**
   * Filtre les caractères non numériques et espaces pour INS
   */
  filterInsInput(event: any): void {
    const input = event.target;
    const value = input.value;

    // Garde seulement les chiffres et espaces/tirets
    const filtered = value.replace(/[^\d\s\-/]/g, '');

    if (value !== filtered) {
      input.value = filtered;
      this.patientForm.get('ins')?.setValue(filtered, { emitEvent: false });
      this.updateInsCharCount();
    }
  }
  private ippValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const value = control.value.toString().replace(/\s/g, '');
    if (!/^\d+$/.test(value)) {
      return { 'ippFormat': true };
    }
    if (value.length < 8) {
      return { 'ippTooShort': true };
    }
    if (value.length > 12) {
      return { 'ippTooLong': true };
    }
    return null;
  }

  /**
   * Validateur personnalisé pour INS (optionnel, mais si saisi: 13-15 caractères)
   */
  private insValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const value = control.value.toString().replace(/\s/g, '');
    if (value.length < 13) {
      return { 'insTooShort': true };
    }
    if (value.length > 15) {
      return { 'insTooLong': true };
    }
    return null;
  }

  private createNameGroup(): FormGroup {
    return this.fb.group({
      use: ['usual'],
      given: ['', [Validators.required]],
      family: ['', [Validators.required]],
      prefix: ['Dr.'],
      suffix: ['']
    });
  }

  private createTelecomGroup(): FormGroup {
    return this.fb.group({
      system: ['', [Validators.required]],
      value: ['', [Validators.required]],
      use: ['']
    });
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      use: ['home'],
      line: [''],
      city: [''],
      postalCode: [''],
      country: ['']
    });
  }

  get namesArray(): FormArray {
    return this.patientForm.get('names') as FormArray;
  }

  get telecomsArray(): FormArray {
    return this.patientForm.get('telecoms') as FormArray;
  }

  get addressesArray(): FormArray {
    return this.patientForm.get('addresses') as FormArray;
  }

  get emergencyContactForm(): FormGroup {
    return this.patientForm.get('emergencyContact') as FormGroup;
  }

  addName(): void {
    this.namesArray.push(this.createNameGroup());
  }

  removeName(index: number): void {
    if (this.namesArray.length > 1) {
      this.namesArray.removeAt(index);
    }
  }

  addTelecom(): void {
    this.telecomsArray.push(this.createTelecomGroup());
  }

  removeTelecom(index: number): void {
    this.telecomsArray.removeAt(index);
  }

  addAddress(): void {
    this.addressesArray.push(this.createAddressGroup());
  }

  removeAddress(index: number): void {
    this.addressesArray.removeAt(index);
  }

  /**
   * Bascule le mode d'édition personnalisée du médecin traitant
   */
  toggleCustomPractitioner(): void {
    this.customPractitionerMode = !this.customPractitionerMode;
    if (!this.customPractitionerMode) {
      this.patientForm.get('generalPractitioner')?.setValue('');
    }
  }

  /**
   * Callback quand la date de naissance est sélectionnée
   * Formate la date avec padding (DD/MM/YYYY)
   */
  onBirthDateChange(event: any): void {
    const date = event.value;
    if (date) {
      // Angular Material retourne un objet Date
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      // Crée une chaîne formatée pour le display
      const formattedDisplay = `${day}/${month}/${year}`;
    }
  }

  /**
   * Recherche les adresses en temps réel lors de la saisie du code postal
   */
  searchAddressByPostalCode(addressIndex: number): void {
    const addressGroup = this.addressesArray.at(addressIndex) as FormGroup;
    if (!addressGroup) return;

    const postalCode = addressGroup.get('postalCode')?.value?.trim() || '';
    console.log(`Recherche code postal: ${postalCode}`);

    if (postalCode.length < 2) {
      this.addressSuggestions[addressIndex] = [];
      return;
    }

    this.addressService.searchByPostalCode(postalCode).subscribe({
      next: (results) => {
        console.log(`Résultats pour ${postalCode}:`, results);
        this.addressSuggestions[addressIndex] = results;
      },
      error: (err) => {
        console.error(`Erreur recherche postal code ${postalCode}:`, err);
        this.addressSuggestions[addressIndex] = [];
      }
    });
  }

  /**
   * Recherche les adresses en temps réel lors de la saisie de la ville
   */
  searchAddressByCity(addressIndex: number): void {
    const addressGroup = this.addressesArray.at(addressIndex) as FormGroup;
    if (!addressGroup) return;

    const city = addressGroup.get('city')?.value?.trim() || '';
    console.log(`Recherche ville: ${city}`);

    if (city.length < 2) {
      this.addressSuggestions[addressIndex] = [];
      return;
    }

    this.addressService.searchByCity(city).subscribe({
      next: (results) => {
        console.log(`Résultats pour ${city}:`, results);
        this.addressSuggestions[addressIndex] = results;
      },
      error: (err) => {
        console.error(`Erreur recherche ville ${city}:`, err);
        this.addressSuggestions[addressIndex] = [];
      }
    });
  }

  /**
   * Sélectionne une adresse à partir des suggestions
   */
  selectAddress(addressIndex: number, address: AddressResult): void {
    console.log(`Sélection adresse index ${addressIndex}:`, address);

    const addressGroup = this.addressesArray.at(addressIndex) as FormGroup;
    if (!addressGroup) {
      console.warn(`Groupe d'adresse non trouvé à l'index ${addressIndex}`);
      return;
    }

    addressGroup.get('postalCode')?.setValue(address.postalCode, { emitEvent: false });
    addressGroup.get('city')?.setValue(address.city, { emitEvent: false });
    addressGroup.get('country')?.setValue(address.country, { emitEvent: false });

    // Fermer les suggestions
    this.addressSuggestions[addressIndex] = [];
    console.log(`Adresse remplie:`, addressGroup.value);
  }

  submitForm(): void {
    this.formSubmitted = true;

    if (this.patientForm.valid) {
      this.isLoading = true;
      const formValue = this.patientForm.value;
      const patientData: BureauEntreesPatient = this.buildPatientObject(formValue);

      this.patientService.createPatient(patientData).subscribe({
        next: (createdPatient) => {
          this.isLoading = false;
          this.snackBar.open(
            `✓ Patient créé avec succès - IPP: ${createdPatient.identifier[0].value}`,
            'Fermer',
            { duration: 5000, horizontalPosition: 'end', panelClass: ['success-snackbar'] }
          );
          this.resetForm();
        },
        error: (error) => {
          // Arrêt du loading en cas d'erreur
          this.isLoading = false;
          const errorMsg = error?.error?.message || error?.message || 'Une erreur inconnue est survenue';
          this.snackBar.open(
            `✗ Erreur: ${errorMsg}`,
            'Fermer',
            { duration: 5000, horizontalPosition: 'end', panelClass: ['error-snackbar'] }
          );
          console.error('Erreur lors de la création du patient:', error);
        },
        complete: () => {
          // S'assurer que le loading est arrêté même en cas d'erreur inattendue
          this.isLoading = false;
        }
      });
    } else {
      // Récupérer les champs invalides
      const invalidFields = this.getInvalidFields(this.patientForm);
      this.snackBar.open(
        `⚠ Champs manquants ou invalides: ${invalidFields.join(', ')}`,
        'Fermer',
        { duration: 4000, horizontalPosition: 'end', panelClass: ['warning-snackbar'] }
      );
      this.markFormGroupTouched(this.patientForm);
    }
  }

  /**
   * Récupère la liste des champs invalides
   */
  private getInvalidFields(formGroup: FormGroup | FormArray): string[] {
    const invalidFields: string[] = [];

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control instanceof FormGroup || control instanceof FormArray) {
        const subInvalid = this.getInvalidFields(control);
        invalidFields.push(...subInvalid);
      } else if (control && control.invalid) {
        invalidFields.push(key);
      }
    });

    return invalidFields;
  }

  private buildPatientObject(formValue: any): BureauEntreesPatient {
    const identifiers = [];

    // IPP (obligatoire)
    identifiers.push({
      system: 'https://chu-ISIS.fr/fhir/sid/ipp',
      value: formValue.ipp,
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          code: 'MR'
        }]
      }
    });

    // INS (optionnel)
    if (formValue.ins) {
      identifiers.push({
        system: 'urn:oid:1.2.250.1.213.1.4.8',
        value: formValue.ins,
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'NI'
          }]
        }
      });
    }

    return {
      resourceType: 'Patient',
      identifier: identifiers as any,
      name: formValue.names.map((name: any) => ({
        use: name.use,
        family: name.family,
        given: name.given ? [name.given] : undefined,
        prefix: name.prefix ? [name.prefix] : undefined,
        suffix: name.suffix ? [name.suffix] : undefined
      })),
      birthDate: this.formatDateForFHIR(formValue.birthDate),
      gender: formValue.gender,
      telecom: formValue.telecoms.length > 0 ? formValue.telecoms : undefined,
      address: formValue.addresses.length > 0 ? formValue.addresses : undefined,
      contact: this.buildContactArray(formValue.emergencyContact),
      extension: formValue.nationality ? [{
        url: 'https://example.org/fhir/StructureDefinition/PatientExtension',
        valueCodeableConcept: {
          coding: [{
            system: 'https://example.org/fhir/CodeSystem/CSAllNationalities',
            code: formValue.nationality,
            display: NationalityDisplay[formValue.nationality as Nationality]
          }]
        }
      }] : undefined,
      generalPractitioner: formValue.generalPractitioner ? [{
        reference: formValue.generalPractitioner
      }] : undefined
    } as BureauEntreesPatient;
  }

  private buildContactArray(emergencyContact: any): any[] | undefined {
    if (emergencyContact.name || emergencyContact.phone) {
      return [{
        name: {
          text: emergencyContact.name
        },
        relationship: emergencyContact.relationship ? [{
          text: emergencyContact.relationship
        }] : undefined,
        telecom: emergencyContact.phone ? [{
          system: 'phone',
          value: emergencyContact.phone
        }] : undefined
      }];
    }
    return undefined;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          }
        });
      }
    });
  }

  resetForm(): void {
    this.patientForm.reset();
    this.namesArray.clear();
    this.namesArray.push(this.createNameGroup());
    this.telecomsArray.clear();
    this.addressesArray.clear();
    this.formSubmitted = false;
    this.currentStep = 1;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    if (step > 0 && step <= this.totalSteps) {
      this.currentStep = step;
      this.scrollToTop();
    }
  }

  getCompletionPercentage(): number {
    let completed;
    const requiredFields = [
      this.patientForm.get('ipp')?.valid,
      (this.namesArray.at(0))?.valid,
      this.patientForm.get('birthDate')?.valid,
      this.patientForm.get('gender')?.valid
    ];
    completed = requiredFields.filter(f => f).length;
    return Math.round((completed / requiredFields.length) * 100);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Formate une date au format FHIR (YYYY-MM-DD)
   */
  private formatDateForFHIR(date: any): string {
    if (!date) {
      return '';
    }

    // Si c'est une string, on la retourne déjà formatée
    if (typeof date === 'string') {
      // Si elle est au format YYYY-MM-DD, on la retourne
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
    }

    // Si c'est un objet Date
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return date;
  }

  /**
   * Formate une date pour l'affichage (DD/MM/YYYY avec padding)
   * Gère tous les formats : Date, string YYYY-MM-DD, DD/MM/YYYY
   */

  formatDateForDisplay(date: any): string {
    if (!date) {
      return '';
    }

    let day: string = '';
    let month: string = '';
    let year: string = '';

    // Si c'est un objet Date
    if (date instanceof Date) {
      day = String(date.getDate()).padStart(2, '0');
      month = String(date.getMonth() + 1).padStart(2, '0');
      year = date.getFullYear().toString();
    }
    // Si c'est une string en format YYYY-MM-DD
    else if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      [year, month, day] = date.split('-');
    }
    // Si c'est déjà en format DD/MM/YYYY, on le retourne tel quel
    else if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    // Sinon, on essaie de parcer la chaîne
    else if (typeof date === 'string') {
      const parts = date.split('/');
      if (parts.length === 3) {
        [day, month, year] = parts;
      }
    }

    if (day && month && year) {
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    return date;
  }
}
