import { Component, effect, inject, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../../services/dark-mode.service';
import { User } from './user';
import { UserStore } from './store/user-store';
import { AddUserComponent } from './add-user/add-user.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    TranslateModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {
  store = inject(UserStore);
  toastr = inject(ToastrService);
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['id', 'name', 'company', 'bs', 'website', 'action'];
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSizeOptions: number[] = [5, 10, 25];
  pageSize: number = 5;
  searchTerm: string = '';

  constructor(
    public darkModeService: DarkModeService,
    private translateService: TranslateService
  ) {
    effect(() => {
      this.dataSource.data = this.store.users();
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      } else {
        console.warn('Paginator not initialized');
      }
      if (this.store.error()) {
        this.toastr.error(this.store.error());
      }
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.store.loadUsers();
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.name.toLowerCase().includes(searchTerm) ||
             data.company.toLowerCase().includes(searchTerm) ||
             data.bs.toLowerCase().includes(searchTerm) ||
             data.website.toLowerCase().includes(searchTerm) ||
             data.id.toString().includes(searchTerm);
    };
  }

  ngOnDestroy(): void {
    console.log('Destroying UsersComponent');
  }

  addUser() {
    this.openPopup(0);
  }

  deleteUser(userId: number) {
    this.store.deleteUser(userId);
  }

  editUser(userId: number) {
    this.openPopup(userId);
  }

  openPopup(userId: number) {
    this.dialog.open(AddUserComponent, {
      width: '50%',
      exitAnimationDuration: '1000ms',
      enterAnimationDuration: '1000ms',
      data: { userId },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }
}