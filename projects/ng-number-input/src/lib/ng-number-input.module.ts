import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgNumberInputComponent } from './ng-number-input.component';



@NgModule({
  declarations: [
    NgNumberInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    NgNumberInputComponent
  ]
})
export class NgNumberInputModule { }
