import { Component, Inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Add this
import { Pincode } from '../pincode';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-pincodes',
  standalone: true,
  imports: [
    CommonModule, // Add this
    FormsModule,
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './add-pincodes.component.html',
})
export class AddPincodesComponent {
  formPincode: Pincode | Omit<Pincode, 'id'> = {
    officeName: '',
    pincode: '',
    districtName: '',
    taluk: '',
    stateName: '',
    city: '',
  };

  constructor(
    public dialogRef: MatDialogRef<AddPincodesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pincode?: Pincode | null } = {}
  ) {
    if (data?.pincode) {
      this.formPincode = { ...data.pincode, pincode: String(data.pincode.pincode) };
    }
  }

  savePincode(form: NgForm) {
    if (form.invalid || this.isFormInvalid()) {
      return;
    }
    this.dialogRef.close({ ...this.formPincode, pincode: String(this.formPincode.pincode) });
  }

  isFormInvalid(): boolean {
    return (
      !this.formPincode.officeName ||
      !this.formPincode.pincode ||
      String(this.formPincode.pincode).length !== 6 ||
      !/^[0-9]{6}$/.test(String(this.formPincode.pincode)) ||
      !this.formPincode.districtName ||
      !this.formPincode.taluk ||
      !this.formPincode.stateName ||
      !this.formPincode.city
    );
  }

  cancel() {
    this.dialogRef.close();
  }
}