import { isGeneratedFile } from '@angular/compiler/src/aot/util';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, IterableDiffers, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
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
export class NgNumberInputComponent implements ControlValueAccessor, OnInit,  AfterViewInit {
  @ViewChildren("numberInput") numberInput: QueryList<ElementRef>;

  test:any
  @Input() max;
  @Input() min;
  @Input() locale:any = ['en-US'];
  @Input()name!: string;
  @Input() placeholder = '';
  @Input() customStyle: any = { height: '100%', width: '100%', border: 'none', outline: 'none', padding: '0px' };
  @Input() parseInt = false;
  @Input() limitTo;
  @Input() format!:any;
  @Input() useString = false;
  @Input() live= true;
  regex = /[^\d.\-]/g;
  disabled!: boolean;
  innerValue!:any;
  innerText!:any;
  target: any;
  text!:any;
  blur = false;
  get value(): any {
    if(this.useString){
      return this.innerValue
    }
    return isNaN(this.innerValue)?null:this.innerValue;
  };
  set value(v: any) {
      if (v !== this.innerValue) {
        let text = v?.toString();
        if(this.useString){
          v = text?.split(',').join('')
        }else{
          v = this.limiter(text)
        }
        this.innerValue = v;
        
      }
  }
   
  constructor() {}


  ngAfterViewInit(): void {
    this.numberInput.changes.subscribe((c)=>{
      setTimeout(()=>{
        this.numberInput.first.nativeElement.focus()
      })
    })
  
  }

  setText(t:any){
    let pos;
    let diff = 0;
    if(this.target){
      pos = this.target.selectionStart
    }
    if (t !== this.text) {
        diff = t?.split(this.regex).length - this.text?.split(this.regex).length;
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

  limiter(text:string):number{
    let v;
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
    return v
  }
  onKeyDown(event){
    if(this.target){
      return
    }
    this.target =  event.target;
  }
  ngOnInit(): void {

    if(!this.live){
      this.useString  = false;
    }
    
    if(!this.useString){
      //allow users to pass limitTo if locale[1] is not provided
      if(!this.limitTo || this.limitTo>3 || this.limitTo <0){
        this.limitTo = 3;
      }
      if(!this.locale[1]){
        this.locale[1]={maximumFractionDigits:this.limitTo};
      }
      if(!this.locale[1].maximumFractionDigits){
          this.locale[1].maximumFractionDigits = this.limitTo;
      }
      if(this.locale[1].maximumFractionDigits>3){
        this.locale[1].maximumFractionDigits = 3
      }
      this.limitTo =  this.locale[1].maximumFractionDigits;
    }else{
      if(!this.limitTo && this.limitTo!==0){
        this.limitTo = Number.POSITIVE_INFINITY;
      }
    
    }

  }
  onChange(event):any{};
  onTouch(event):any{};
  writeValue(value: any): void {
    if(value && value!=this.innerValue){
      if(this.useString){
        this.processInput(value)
        return
      }
      this.processInput(value.toLocaleString(this.locale[0],this.locale[1]));
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
    let text: any = `${value}`.replace(this.regex, '');
    text = this.processDecimals(text);
    return this.processNegatives(text);
  }
  checkBoundaries(number) {
    let originalNumber = number;
    let originalValue = this.value;

    let value = this.value;
    if(this.useString){
      number = parseFloat(number?.split(',').join(''))
      value = parseFloat(value?.split(',').join(''))
    }
      if ((this.max || this.max === 0) && number > this.max) {
        number = this.max;
        if (value < this.max) {
          number = value;
          originalNumber = originalValue
        }
      }
      if ((this.min || this.min === 0) && number < this.min) {
        number = this.min;
        if (value > this.min) {
          number = value;
          originalNumber = originalValue

        }
      }
      return this.useString ? originalNumber : number
  }

  processStatic(text:string){
    let number;
    if(text?.includes('.')){
      let left = text?.split('.')[0].substring(0,14);
      let diff  =  14 - left.length;
      if(diff>this.limitTo){
        diff = this.limitTo
      }
      number = Number([left,text?.split('.')[1].substring(0,diff)].join('.'))
    }else{
      number = Number(text?.split('.')[0].substring(0,14))
    }
    this.value = number;
    this.setText(number.toLocaleString(this.locale[0],this.locale[1]));
    this.onChange(this.value)
  }

  processInput(value: string) {
    if (!value) {
      this.value = null;
      this.onChange(null);
       let temp = '';
        if(this.format){
        temp = this.format(temp)
        }
        this.setText(temp)
        if(!this.live){
          setTimeout(() => {   
              this.test = null
            });
        }
      return;
    }
   
    let text = this.sanitize(value);

    if(!this.useString){
      let number = this.limiter(text);
      console.log(number)
      if (text && (number || number === 0)) {
        if (this.parseInt) {
          // eslint-disable-next-line radix
          number = parseInt(text);
        }
        this.value = this.checkBoundaries(number);
        let temp =  this.value.toLocaleString(this.locale[0],this.locale[1]);
        //  Number('2.') results in 2
        // Doing below to preserve the .        
        if (text.indexOf('.') === text.length - 1) {
          temp += '.';
        }
        if(this.format){
          temp = this.format(temp)
        }
        this.setText(temp)
        this.onChange(this.value);

        if(!this.live){
          setTimeout(() => {   
              this.test = this.value.toString()
              if (text.indexOf('.') === text.length - 1) {
                this.test += '.';
              }
            });
        }
        return;
      }
    }else{
      if(this.parseInt){
        text = text?.split('.')[0]
      }
      text = text.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      
      let right = text.split('.')[1];
      if(right?.length){
        text = [text.split('.')[0],right?.substring(0,this.limitTo)].join('.')
      }
      text= this.checkBoundaries(text);
      this.value = text
      if(this.format){
        text = this.format(text)
      }
      this.setText(text)
      this.onChange(this.value);
      return
    }
    if(this.format){
      text = this.format(text)
    }
    this.setText(text)
    this.value = null;
    this.onChange(this.value);
    if(!this.live){
      setTimeout(() => {   
          this.test = null
        });
    }
  }
}
