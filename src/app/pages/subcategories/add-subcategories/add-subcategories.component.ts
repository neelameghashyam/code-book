import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Fixed import
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subcategory } from '../subcategories';

@Component({
  selector: 'app-add-subcategories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Use ReactiveFormsModule instead of FormsModule
    MatButtonModule,
    MatIconModule, // Correct module for MatIcon
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './add-subcategories.component.html',
  styleUrls: ['./add-subcategories.component.scss'],
})
export class AddSubcategoriesComponent implements OnInit {
  subcategoryForm: FormGroup;

  constructor(
    private fb: FormBuilder, // Standard injection
    public dialogRef: MatDialogRef<AddSubcategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subcategory?: Subcategory; categoryId?: number; CategoryName?: string } = {}
  ) {
    this.subcategoryForm = this.fb.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      imageUrl: ['', Validators.required],
      comments: [''],
      categoryId: [this.data?.categoryId || 0, Validators.required],
      CategoryName: [this.data?.CategoryName || '']
    });
  }

  ngOnInit(): void {
    if (this.data?.subcategory) {
      this.subcategoryForm.patchValue(this.data.subcategory);
    }
  }

  saveSubcategory() {
    if (this.subcategoryForm.invalid) {
      this.subcategoryForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.subcategoryForm.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}