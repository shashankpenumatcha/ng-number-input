import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-number-input',
  templateUrl: './ng-number-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgNumberInputComponent),
      multi: true,
    },
  ],
})
export class NgNumberInputComponent
  implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy
{
  @ViewChildren('numberInput') numberInput: QueryList<ElementRef>;
  test: any;
  @Input() max = Number.MAX_SAFE_INTEGER;
  @Input() min = Number.NEGATIVE_INFINITY;
  @Input() locale: any = ['en-US'];
  @Input() name!: string;
  @Input() placeholder = '';
  @Input() customStyle: any = {
    height: '100%',
    width: '100%',
    border: 'none',
    outline: 'none',
    padding: '0px',
  };
  @Input() parseInt = false;
  @Input() limitTo;
  @Input() format!: any;
  @Input() useString = false;
  @Input() live = true;
  fractionSeperator = '.';
  thousandsSeperator = ',';
  regex = /[^\d.\-]/g;
  disabled!: boolean;
  innerValue!: any;
  innerText!: any;
  target: any;
  text_!: any;
  blur = true;
  subscription = new Subscription();
  correction:any;
  preserveDecimals;
  minfractions;
  minIntegers;
  currentKey;
  get value(): any {
    if (this.useString) {
      return this.innerValue;
    }
    return isNaN(this.innerValue) ? null : this.innerValue;
  }
  set value(v: any) {
    if (v !== this.innerValue) {
      const text = v?.toString();
      if (this.useString) {
        v = text?.split(',').join('');
      } else if (v) {
        v = this.limiter(text);
      }
      this.innerValue = v;
    }
  }

  get text() {
    return this.text_;
  }

  set text(v) {
    if (v != this.text_) {
      this.processInput(v);
    }
  }

  onChange(event): any {}
  onTouch(event): any {}
  writeValue(value: any): void {
    if (value !== this.innerValue) {
      if (this.useString) {
        this.processInput(value);
        return;
      }
      this.processInput(value?.toLocaleString(this.locale[0], this.locale[1]));
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

  constructor(private cdr: ChangeDetectorRef, private _renderer: Renderer2) {}

  ngOnDestroy() {
    {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      this.numberInput.changes.subscribe((c) => {
        this.numberInput?.first?.nativeElement?.focus();
      })
    );
  }

  ngOnInit(): void {
    if (!this.live) {
      this.useString = false;
    }
    if (this.useString || !this.locale?.length) {
      this.locale = ['en-US'];
    }
    
    this.initLocaleAndLimit();
    /* if(this.locale[1].minimumFractionDigits||(this.locale[1].style &&this.locale[1].style=='currency')){
      this.preserveDecimals = true;
    } */
    let seperators = {
      ...this.calculateSeperators(
        this.live == false ? 'en-US' : this.locale[0]
      ),
    };
    this.thousandsSeperator = seperators.thousandsSeperator;
    this.fractionSeperator = seperators.fractionSeperator;

    
  }

  setLocaleOptions(option, value) {
    if (!this.locale[1]) {
      this.locale[1] = {};
    }
    this.locale[1][option] = value;
  }

  calculateSeperators(locale?) {
    let thousandsSeperator;
    let fractionSeperator;
    let formattedText: any = new Intl.NumberFormat(locale).format(1234567.89);
    formattedText = formattedText.replace(/[\d]/g, '');
    if (this.live ) {
      this.regex = new RegExp(`[^\\d${formattedText[2]}\\-]`, 'g');
    }
    thousandsSeperator = formattedText[0];
    fractionSeperator = formattedText[2];
    if(this.live){
      let formattedText: any = new Intl.NumberFormat(this.locale[0],this.locale[1]).format(0)?.replace(this.regex,'');
      this.minIntegers = formattedText?.split('.')[0]?.length
      this.minfractions = formattedText?.split('.')[1]?.length

    }
    return { thousandsSeperator, fractionSeperator };
  }

  initLocaleAndLimit() {
    if (!this.useString) {
      //allow users to pass limitTo if locale[1] is not provided
      if (!this.limitTo || this.limitTo > 3 || this.limitTo < 0) {
        this.limitTo = 3;
      }
      this.setLocaleOptions('maximumFractionDigits', this.limitTo);
      if (this.locale[1].maximumFractionDigits > 3) {
        this.locale[1].maximumFractionDigits = 3;
      }
      this.limitTo = this.locale[1].maximumFractionDigits;
    } else {
      if (!this.limitTo && this.limitTo !== 0) {
        this.limitTo = Number.POSITIVE_INFINITY;
      }
    }
  }
  setText(t: any) {
    let initPos;
    let pos;
    let diff = 0;
    if (this.target) {
      pos = this.target.selectionStart;
      initPos = pos;
    }

    console.log(this.value)
    console.log(pos)
    if (t !== this.text) {
      diff = t?.split(this.regex).length - this.text?.split(this.regex).length;
      diff = diff 
      this.text_ = new String(t);
      if (diff < 0 || diff > 0 ) {
        pos += diff ;
      }
    }
    if(this.live && !this.useString && this.minIntegers && (!this.value||this.correction||
      (initPos == (t.indexOf(this.fractionSeperator)+1) &&
       this.value?.toString()?.split(this.fractionSeperator)[0]?.length<=this.minIntegers)&&
       this.currentKey !== this.fractionSeperator
      )){
      if(this.correction){
        this.correction = false;
      }
      pos = t.length
      if(t.includes(this.fractionSeperator)){
        pos = t.indexOf(this.fractionSeperator)
      }else{
        pos = t.length
      }
    }
    if (pos) {
      setTimeout(() => {
        if(this.live&&!this.useString){
          let formatted = new Intl.NumberFormat(this.locale[0],this.locale[1]).format(0)
            formatted = formatted.replace(this.regex,'');
        }
        this.target.setSelectionRange(pos, pos);

      });
    }
  }
  limiter(sanitizedText: string): number {
    sanitizedText = sanitizedText?.replace(this.fractionSeperator, '.');
    if (sanitizedText.includes('.')) {
      sanitizedText = [
        sanitizedText.split('.')[0],
        sanitizedText.split('.')[1].substring(0, this.limitTo),
      ].join('.');
    }
    let m = Number(sanitizedText);
    if (m > Number.MAX_SAFE_INTEGER || m < -Number.MAX_SAFE_INTEGER) {
      if (this.live) {
        return Number(this.sanitize(this.text_));
      } else {
        let seperators = this.calculateSeperators(this.locale[0]);
        let temp = this.text_?.replace(
          new RegExp(`[^\\d${seperators.fractionSeperator}\\-]`, 'g'),
          ''
        );
        temp = temp.replace(seperators.fractionSeperator, '.');
        return Number(temp);
      }
    }
    return m;
  }
  onKeyDown(event) {
    if(event.key){
      this.currentKey = event.key
    }
    if (this.target) {
      if(this.target?.selectionStart!=this.target?.selectionEnd){
        this.correction = true;
      }
      return;
    }
    this.target = event.target;
  }
  processDecimals(text: string) {
    const hasPeriod = text.includes(this.fractionSeperator);
    const arr: any = text.split(this.fractionSeperator);
    let value = '';
    arr.map((m: any, i: number) => {
      value += m;
      if (i === 0 && hasPeriod) {
        value += this.fractionSeperator;
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
    let useStringText;
    let value = this.value;
    if (this.useString) {
      useStringText = number;
      value = Number(value);
      number = Number(useStringText);
    }
    if ((this.max || this.max === 0) && number > this.max) {
      number = this.max;
      useStringText = this.max.toString();
      if (value <= this.max) {
        number = value;
        useStringText = this.text_
          ?.split(',')
          ?.join('')
          ?.replace(/[^\d.\-]/g, '');
      }
    }
    if ((this.min || this.min === 0) && number < this.min) {
      number = this.min;
      useStringText = this.min.toString();
      if ((value || value == 0) && value >= this.min) {
        number = value;
        useStringText = this.text_
          ?.split(',')
          ?.join('')
          ?.replace(/[^\d.\-]/g, '');
      }
    }

    return this.useString ? useStringText : number;
  }
  processInput(value: string) {
    
    if (!value) {
      this.setText(this.format ? this.format('') : '');
      if (!this.live) {
        this.test = new String('');
      }
      this.value = null;
      this.onChange(null);
      return;
    }
   
    let text = this.sanitize(value);
    if (this.useString) {
      return this.processStringInput(text);
    }
    let number = this.limiter(text);
    if (text && (number || number === 0)) {
      if (this.parseInt) {
        // eslint-disable-next-line radix
        number = parseInt(text);
      }
      number = this.checkBoundaries(number);
      let localeOptions = this.locale[1];

      if (text.includes(this.fractionSeperator) && !this.minfractions) {
          localeOptions = localeOptions
            ? { ...localeOptions, minimumFractionDigits: 1 }
            : { minimumFractionDigits: 1 };
        
      }
      
      let temp = number.toLocaleString(this.locale[0], localeOptions);
      if (this.format) {
        temp = this.format(temp);
      }
      this.setText(temp);
      this.value = number;
      this.onChange(this.value);

      if (!this.live) {
        let right = text.split(this.fractionSeperator)[1];
        if (right?.length > this.limitTo) {
          right = right?.substring(0, this.limitTo);
        }
        let temp = this.value?.toString();
        if (text.includes(this.fractionSeperator)) {
          temp = [
            this.value?.toString()?.split(this.fractionSeperator)[0],
            right,
          ].join(this.fractionSeperator);
        }
        this.test = new String(temp);
      }
      return;
    }
    if (this.format) {
      text = this.format(text);
    }
    this.setText(text);
    if (!this.live) {
      this.test = new String(text);
    }
    this.value = null;
    this.onChange(this.value);
    
  }
  processStringInput(text) {
    if (this.parseInt) {
      text = text?.split(this.fractionSeperator)[0];
    }
    text = this.checkBoundaries(text);
    text = text.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    let fraction = text.split(this.fractionSeperator)[1];
    if (fraction?.length) {
      let limit = this.limitTo;
      text = [
        text?.split(this.fractionSeperator)[0],
        text?.split(this.fractionSeperator)[1].substring(0, limit),
      ].join(this.fractionSeperator);
    }
    if (this.format) {
      text = this.format(text);
    }
    this.setText(text);
    this.value = text;
    this.onChange(this.value);
    return;
  }
}
