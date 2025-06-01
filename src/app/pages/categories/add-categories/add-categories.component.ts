import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Fixed import
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Category } from '../category';

@Component({
  selector: 'app-add-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Use ReactiveFormsModule instead of FormsModule
    MatButtonModule,
    MatIconModule, // Correct module for MatIcon
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './add-categories.component.html',
  styleUrls: ['./add-categories.component.scss'],
})
export class AddCategoriesComponent implements OnInit {
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder, // Standard injection
    public dialogRef: MatDialogRef<AddCategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category | null } = {}
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      imageUrl: ['', Validators.required],
      comments: [''],
    });
  }

  ngOnInit(): void {
    if (this.data?.category) {
      this.categoryForm.patchValue(this.data.category);
    }
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.categoryForm.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}