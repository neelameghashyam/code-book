import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../user';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../store/user-store';
import { inject } from '@angular/core';
import { DarkModeService } from '../../../services/dark-mode.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule

  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent implements OnInit {
  title = 'Add User';
  store = inject(UserStore);
  isEdit = false;

  userForm = new FormGroup({
    id: new FormControl({ value: 0, disabled: true }),
    name: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    bs: new FormControl('', Validators.required),
    website: new FormControl('', Validators.required),
  });

  constructor(
    private ref: MatDialogRef<AddUserComponent>,
    private translateService: TranslateService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    public darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    if (this.data?.userId) {
      this.isEdit = true;
      this.title = 'Edit User';
      const user = this.store.getUser(this.data.userId);
      if (user) {
        this.userForm.patchValue({
          id: user.id,
          name: user.name,
          company: user.company,
          bs: user.bs,
          website: user.website,
        });
      } else {
        this.toastr.error('Failed to load user data');
        this.closePopup();
      }
    }
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const userData: User = {
      id: this.isEdit ? this.userForm.getRawValue().id! : Date.now(),
      name: this.userForm.getRawValue().name!,
      company: this.userForm.getRawValue().company!,
      bs: this.userForm.getRawValue().bs!,
      website: this.userForm.getRawValue().website!,
    };

    try {
      if (this.isEdit) {
        this.store.updateUser(userData);
        this.toastr.success('User updated successfully');
      } else {
        this.store.addUser(userData);
        this.toastr.success('User added successfully');
      }
      this.closePopup();
    } catch (error) {
      this.toastr.error(this.isEdit ? 'Failed to update user' : 'Failed to add user');
    }
  }

  closePopup() {
    this.ref.close();
  }
}