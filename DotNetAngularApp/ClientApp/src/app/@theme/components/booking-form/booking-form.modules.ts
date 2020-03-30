import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; //for binding forms
import { BookingFormComponent } from './booking-form.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BookingFormComponent],
  exports: [BookingFormComponent],
  bootstrap: [BookingFormComponent],
  providers: [DatePipe]
})
export class BookingFormModule {}