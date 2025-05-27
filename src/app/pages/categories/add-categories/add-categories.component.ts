import { Component, Inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Category } from '../category';

@Component({
  selector: 'app-add-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './add-categories.component.html',
  styleUrls: ['./add-categories.component.scss'],
})
export class AddCategoriesComponent {
  formCategory: Category | Omit<Category, 'id' | 'createdAt' | 'modifiedAt'> = {
    name: '',
    icon: '',
    imageUrl: '',
    comments: '',
  };

  constructor(
    public dialogRef: MatDialogRef<AddCategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category | null } = {}
  ) {
    if (data?.category) {
      this.formCategory = { ...data.category };
    }
  }

  saveCategory(form: NgForm) {
    if (form.invalid || this.isFormInvalid()) {
      return;
    }
    this.dialogRef.close(this.formCategory);
  }

  isFormInvalid(): boolean {
    return (
      !this.formCategory.name ||
      !this.formCategory.icon ||
      !this.formCategory.imageUrl
    );
  }

  cancel() {
    this.dialogRef.close();
  }
}