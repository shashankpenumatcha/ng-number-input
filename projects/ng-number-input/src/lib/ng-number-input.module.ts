import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgNumberInputComponent } from './ng-number-input.component';
import { NgNumberInputPipe } from './ng-number-input.pipe';



@NgModule({
  declarations: [
    NgNumberInputComponent,
    NgNumberInputPipe
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
