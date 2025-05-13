import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { FormsModule } from '@angular/forms';

interface ServiceProvider {
  id: number;
  country: string;
  spName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  postalCode: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public darkModeService = inject(DarkModeService);
  public responsiveService = inject(ResponsiveService);
  public providerForm: FormGroup;
  private _countries: string[] = [];
  public exampleCountries: string[] = [];
  public serviceProviders: ServiceProvider[] = [];
  public filteredProviders: ServiceProvider[] = [];
  public searchTerm: string = '';
  public pageSize: number = 5;
  public pageIndex: number = 0;
  public pageSizeOptions: number[] = [5, 10, 25];

  get countries(): string[] {
    return this._countries;
  }

  constructor(private fb: FormBuilder) {
    this.providerForm = this.fb.group({
      country: ['', Validators.required],
      spName: ['', [Validators.required, Validators.minLength(3)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''], // Added missing control
      addressLine3: [''],
      city: ['', Validators.required],
      state: ['', Validators.pattern('^[A-Za-z]{2,3}$')],
      postalCode: ['', [Validators.required, Validators.minLength(5)]],
      id: [null]
    });
  }

  ngOnInit(): void {
    this._countries = ['USA', 'Canada', 'UK', 'Australia', 'India'];
    this.loadFromLocalStorage();
    this.filteredProviders = [...this.serviceProviders];
  }

  onSubmit() {
    if (this.providerForm.valid) {
      const formValue = this.providerForm.value;
      if (formValue.id) {
        // Update existing provider
        const index = this.serviceProviders.findIndex(p => p.id === formValue.id);
        if (index !== -1) {
          this.serviceProviders[index] = { ...formValue, id: formValue.id };
        }
      } else {
        // Add new provider
        const newProvider: ServiceProvider = {
          ...formValue,
          id: this.serviceProviders.length + 1
        };
        this.serviceProviders.push(newProvider);
      }
      this.saveToLocalStorage();
      this.filteredProviders = [...this.serviceProviders];
      this.providerForm.reset();
      this.providerForm.patchValue({ country: this._countries[0] });
    } else {
      console.log('Form is invalid. Please check the fields.');
      this.providerForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.providerForm.reset();
    this.providerForm.patchValue({ country: this._countries[0] });
  }

  editProvider(provider: ServiceProvider) {
    this.providerForm.setValue(provider);
  }

  deleteProvider(id: number) {
    this.serviceProviders = this.serviceProviders.filter(p => p.id !== id);
    this.saveToLocalStorage();
    this.filteredProviders = [...this.serviceProviders];
    this.pageIndex = 0;
  }

  applyFilter() {
    const filterValue = this.searchTerm.toLowerCase();
    this.filteredProviders = this.serviceProviders.filter(provider =>
      Object.values(provider).some(value =>
        value?.toString().toLowerCase().includes(filterValue)
      )
    );
    this.pageIndex = 0;
  }

  saveToLocalStorage() {
    localStorage.setItem('serviceProviders', JSON.stringify(this.serviceProviders));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('serviceProviders');
    if (data) {
      this.serviceProviders = JSON.parse(data);
      this.filteredProviders = [...this.serviceProviders];
    }
  }

  // Pagination methods
  get paginatedData(): ServiceProvider[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredProviders.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    this.pageIndex = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.pageIndex = 0;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProviders.length / this.pageSize);
  }
}