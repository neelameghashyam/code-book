import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { PincodesService } from './pincodes.service';
import { Pincode } from './pincode';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { AddPincodesComponent } from './add-pincodes/add-pincodes.component';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pincodes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatIcon,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatMenuModule,
    MatSelectModule,
  ],
  templateUrl: './pincodes.component.html',
  styleUrls: ['./pincodes.component.scss']
})
export class PincodesComponent implements OnInit, OnDestroy {
  service = inject(PincodesService);
  dialog = inject(MatDialog);
  responsive = inject(ResponsiveService);
  darkModeService = inject(DarkModeService);

  editingPincode: Pincode | null = null;
  selectedPincodes: Pincode[] = [];
  displayedColumns: string[] = [];
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isMobile: boolean = false;
  isTablet: boolean = false;
  breakpointSubscription: Subscription | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.breakpointSubscription = this.responsive.currentBreakpoint().subscribe(breakpoint => {
      this.isMobile = breakpoint === 'xsmall';
      this.isTablet = breakpoint === 'small' || breakpoint === 'medium';
      this.updateDisplayedColumns();
    });
    this.darkModeService.applyTheme();
  }

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  updateDisplayedColumns() {
    if (this.isMobile) {
      this.displayedColumns = ['pincode', 'city', 'actions'];
    } else if (this.isTablet) {
      this.displayedColumns = ['select', 'officeName', 'pincode', 'city', 'districtName', 'actions'];
    } else {
      this.displayedColumns = ['select', 'officeName', 'pincode', 'districtName', 'taluk', 'stateName', 'city', 'actions'];
    }
  }

  refreshTable() {
    this.sortField = null;
    this.sortDirection = 'asc';
    this.service.sortPincodes(null, 'asc');
    this.service.setPage(1);
    this.service.setSearchQuery('');
    this.selectedPincodes = [];
    const searchInput = document.getElementById('searchPincodes') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.service.getPincodes();
    console.log('Table refreshed: sort, pagination, search reset, and data reloaded');
  }

  private openPincodeDialog(data: any, onResult: (result: Pincode) => void) {
  this.dialog.open(AddPincodesComponent, {
    width: this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px',
    maxWidth: '100vw',
    data
  }).afterClosed().subscribe(result => result && onResult(result));
}

openAddPincodeDialog = () => this.openPincodeDialog({}, result => this.service.addPincode(result));

startEdit = (pincode: Pincode) => {
  this.editingPincode = { ...pincode };
  this.openPincodeDialog({ pincode: this.editingPincode }, result => {
    this.service.updatePincode(result);
    this.editingPincode = null;
  });
}

  onSearchQueryChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.service.setSearchQuery(inputElement.value);
  }

  onPageChange(event: any) {
    this.service.setPage(event.pageIndex + 1);
    this.selectedPincodes = [];
    console.log('Page Changed to:', event.pageIndex + 1);
  }

  sortColumn(field: string, direction: 'asc' | 'desc') {
    this.sortField = field;
    this.sortDirection = direction;
    this.service.sortPincodes(this.sortField, this.sortDirection);
  }

  togglePincode(pincode: Pincode) {
    const index = this.selectedPincodes.findIndex(p => p.id === pincode.id);
    if (index === -1) {
      this.selectedPincodes.push(pincode);
    } else {
      this.selectedPincodes.splice(index, 1);
    }
  }

  isSelected(pincode: Pincode): boolean {
    return this.selectedPincodes.some(p => p.id === pincode.id);
  }

  toggleAllPincodes(checked: boolean) {
    if (checked) {
      this.selectedPincodes = [...this.service.paginatedPincodes()];
    } else {
      this.selectedPincodes = [];
    }
  }

  isAllSelected(): boolean {
    return this.service.paginatedPincodes().length > 0 &&
           this.service.paginatedPincodes().every(pincode => this.isSelected(pincode));
  }

  deleteSelectedPincodes() {
    this.selectedPincodes.forEach(pincode => this.service.deletePincode(pincode.id));
    this.selectedPincodes = [];
  }

  getPageNumbers(): number[] {
    const totalPages = this.service.totalPages();
    const currentPage = this.service.currentPage();
    const maxPagesToShow = this.isMobile ? 3 : this.isTablet ? 4 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages: number[] = [];
    if (totalPages > 0) {
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }

  trackById(index: number, pincode: Pincode): number {
    return pincode.id;
  }
}