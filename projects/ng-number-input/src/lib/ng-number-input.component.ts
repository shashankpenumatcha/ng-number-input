import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, forwardRef, Input, IterableDiffers, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ng-number-input',
  templateUrl: './ng-number-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgNumberInputComponent),
      multi: true,
    }
  ]
})
export class NgNumberInputComponent implements ControlValueAccessor, OnInit {
  @Input() max =  99999999999999;
  @Input() min = -99999999999999;
  @Input() locale = 'en-US';
  @Input()name!: string;
  @Input() placeholder = '';
  @Input() customStyle: any = { height: '100%', width: '100%', border: 'none', outline: 'none', padding: '0px' };
  @Input() parseInt = false;
  @Input() limitTo = 3;
  @Input() format!:any;
  disabled!: boolean;
  innerValue!:any;
  innerText!:any;
  target: any;
  text!:any;
  get value(): any {
    return this.innerValue;
  };
  set value(v: any) {
      if (v !== this.innerValue) {
        let text = v?.toString();
        if(text?.includes('.')){
          let left = text?.split('.')[0].substring(0,14);
          let diff  =  14 - left.length;
          if(diff>this.limitTo){
            diff = this.limitTo
          }
          v = Number([left,text?.split('.')[1].substring(0,diff)].join('.'))
        }else{
          v = Number(text?.split('.')[0].substring(0,14))
        }
        this.innerValue = v;
      }
  }
   
  constructor() {}

  setText(t:any){
    let pos;
    let diff = 0;
    if(this.target){
      pos = this.target.selectionStart
    }
    if (t !== this.text) {
        diff = t?.split(',').length - this.text?.split(',').length;
        setTimeout(()=>{
          this.text = t;
        })
        if(diff<0 || diff>0){
          pos+=diff
        }
    }
    if(pos){
      setTimeout(()=>{
        this.target.setSelectionRange(pos,pos);
      })
    }
  }

  onKeyDown(event){
    if(this.target){
      return
    }
    this.target =  event.target;
  }
  ngOnInit(): void {
    if(this.min && this.min <-99999999999999){
      this.min = -99999999999999
    }
    if(this.max && this.max > 99999999999999){
      this.max = 99999999999999
    }
    if(!this.limitTo || this.limitTo>3 || this.limitTo <0){
      this.limitTo = 3;
    }
  }
  onChange(event):any{};
  onTouch(event):any{};
  writeValue(value: any): void {
    if(value && value!=this.innerValue){
      this.processInput(value.toLocaleString(this.locale));
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  processDecimals(text: string) {
    const hasPeriod = text.includes('.');
    const arr: any = text.split('.');
    let value = '';
    arr.map((m:any, i:number) => {
      value += m;
      if (i === 0 && hasPeriod) {
        value += '.';
      }
    });
    return value;
  }
  processNegatives(text: string) {
    const isNegative = text.startsWith('-');
    const arr = text?.split('-');
    text = arr.join('');
    if (isNegative) {
      text = `-${text}`;
    }
    return text;
  }
  sanitize(value: string) {
    let text: any = `${value}`.replace(/[^\d.\-]/g, '');
    text = this.processDecimals(text);
    return this.processNegatives(text);
  }
  checkBoundaries(number) {
    if ((this.max || this.max === 0) && number > this.max) {
      number = this.max;
      if (this.value < this.max) {
        number = this.value;
      }
    }
    if ((this.min || this.min === 0) && number < this.min) {
      number = this.min;
      if (this.value > this.min) {
        number = this.value;
      }
    }
    return number;
  }
  processInput(value: string) {
    
    if (!value) {
      this.value = null;
      this.onChange(null);
       let temp = '';
        if(this.format){
        temp = this.format(temp, this.value)
        }
        this.setText(temp)
      return;
    }
   
    const text = this.sanitize(value);
    let number = Number(text);
    
    if (text && (number || number === 0)) {
      if (this.parseInt) {
        // eslint-disable-next-line radix
        number = parseInt(text);
      }
      this.value = this.checkBoundaries(number);
      let temp =  this.value.toLocaleString(this.locale);
      //  Number('2.') results in 2
      // Doing below to preserve the .        
      if (text.indexOf('.') === text.length - 1) {
        temp += '.';
      }
      if(text.includes('.')){

        let left = number.toString().split('.')[0].substring(0,14);
          let diff  =  14 - left.length;
          if(diff>this.limitTo){
            diff = this.limitTo
          }
        temp = [
          temp.split('.')[0], 
          text.split('.')[1].substring(0,diff)
        ].join('.');
      }
      if(this.format){
        temp = this.format(temp, this.value)
      }
      
      this.setText(temp)
      this.onChange(this.value);
      return;
    }
      let temp = text;
      if(this.format){
        temp = this.format(temp,this.value)
      }
      this.setText(temp)
    this.value = null;
    this.onChange(this.value);
  }
}
