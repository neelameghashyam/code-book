import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Subcategory } from '../subcategories';

@Component({
  selector: 'app-add-subcategories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './add-subcategories.component.html',
  styleUrls: ['./add-subcategories.component.scss'],
})
export class AddSubcategoriesComponent {
  formSubcategory: Subcategory | Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'> = {
    name: '',
    icon: '',
    imageUrl: '',
    comments: '',
    categoryId: this.data?.categoryId || 0,
    CategoryName: this.data?.CategoryName || '',
  };

  constructor(
    public dialogRef: MatDialogRef<AddSubcategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subcategory?: Subcategory; categoryId?: number; CategoryName?: string } = {}
  ) {
    if (data?.subcategory) {
      this.formSubcategory = { ...data.subcategory };
    }
  }

  saveSubcategory(form: any) {
    if (form.invalid || this.isFormInvalid()) {
      return;
    }
    this.dialogRef.close(this.formSubcategory);
  }

  isFormInvalid(): boolean {
    return (
      !this.formSubcategory.name ||
      !this.formSubcategory.icon ||
      !this.formSubcategory.imageUrl ||
      !this.formSubcategory.categoryId
    );
  }

  cancel() {
    this.dialogRef.close();
  }
}