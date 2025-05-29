import { Injectable, inject } from '@angular/core';
import { PincodeStore } from './pincodes.store';
import { Pincode } from './pincode';

@Injectable({ providedIn: 'root' })
export class PincodesService {
  private pincodeStore = inject(PincodeStore);

  pincodes = this.pincodeStore.pincodes;
  filteredPincodes = this.pincodeStore.filteredPincodes;
  paginatedPincodes = this.pincodeStore.paginatedPincodes;
  totalPages = this.pincodeStore.totalPages;
  currentPage = this.pincodeStore.currentPage;
  pageSize = this.pincodeStore.pageSize;
  isLoading = this.pincodeStore.isLoading;
  error = this.pincodeStore.error;

  getPincodes() {
    return this.pincodeStore.loadPincodes();
  }

  addPincode(pincode: Omit<Pincode, 'id'>) {
    return this.pincodeStore.addPincode(pincode);
  }

  updatePincode(pincode: Pincode) {
    return this.pincodeStore.updatePincode(pincode);
  }

  deletePincode(id: number) {
    return this.pincodeStore.deletePincode(id);
  }

  setPage(page: number) {
    this.pincodeStore.setPage(page);
  }

  setPageSize(pageSize: number) {
    this.pincodeStore.setPageSize(pageSize);
  }

  setSearchQuery(query: string) {
    this.pincodeStore.setSearchQuery(query);
  }

  sortPincodes(field: string, direction: 'asc' | 'desc') {
    this.pincodeStore.sortPincodes(field, direction);
  } 
}