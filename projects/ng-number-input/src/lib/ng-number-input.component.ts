/* eslint-disable eqeqeq */
/* eslint-disable prefer-const */
import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-number-input',
  templateUrl: './ng-number-input.component.html',
  styles:[`.hide-caret {caret-color: transparent !important}`],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgNumberInputComponent),
      multi: true
    }
  ]
})
export class NgNumberInputComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('numberInput') numberInput: QueryList<ElementRef>;
  test: any;
  @Input() mode = 'default'; //['default', 'string', 'lazy']
  @Input() max = Number.MAX_SAFE_INTEGER;
  @Input() min = -Number.MAX_SAFE_INTEGER;
  @Input() locale: any = ['en-US'];
  @Input() name!: string;
  @Input() placeholder = '';
  @Input() customStyle: any;
  @Input() parseInt = false;
  @Input() limitTo;
  @Input() format!: any;
  useString = false;
  live = true;
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
  correction: any;
  minfractions;
  minIntegers;
  currentKey;
  previousCursorPosition;
  currentCursorPosition;
  groupsDelta=0;
  hideCaret = false;
  previousText;
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

  constructor(private elementRef: ElementRef) {}

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

  ngOnDestroy() {
    {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      this.numberInput?.changes?.subscribe(c => {
        this.numberInput?.first?.nativeElement?.focus();
      })
    );
  }

  setMode(){
    if(!this.mode || typeof(this.mode)!='string'){
      this.mode = 'default'
    }
    if(this.mode=='string'){
      this.live = true
      this.useString = true;
    }
    if(this.mode=='lazy'){
      this.live = false;
      this.useString = false;
    }
    if(this.mode=='default'){
      this.live=true;
    }
  }

  seLocaleOptions(){

  }

  ngOnInit(): void {
    this.setMode();
    this.setCustomStyle();
    if (!this.live) {
      this.useString = false;
    }
    this.initLocaleAndLimit();
    let seperators = {
      ...this.getLocaleSeperators(this.live == false ? 'en-US' : this.locale[0], this.live,this.locale)
    };
    this.thousandsSeperator = seperators.group;
    this.fractionSeperator = seperators.decimal;
    this.minIntegers = seperators.minIntegers;
    this.minfractions = seperators.minfractions;
    this.regex = seperators.regex;
    this.test = this.value;
  }

  setCustomStyle(){
    if(this.customStyle){
      this.customStyle ={
        height: '100%',
        width: '100%',
        border: 'none',
        outline: 'none',
        padding: '0px',
        ...this.customStyle
      };
    }
  }

  setLocaleOptions(option, value) {
    if (!this.locale[1]) {
      this.locale[1] = {};
    }
    this.locale[1][option] = value;
  }

  initLocaleAndLimit() {
    if (this.useString || !this.locale?.length) {
      this.locale = ['en-US'];
    }
    if (!this.useString) {
      if(!this.locale[1]){
        this.locale[1]={}
      }
      if(this.locale&&this.locale[1]&&this.locale[1].maximumFractionDigits&&!this.limitTo){
        this.limitTo = this.locale[1].maximumFractionDigits;
        
      } 
      if (!this.limitTo || this.limitTo > 3 || this.limitTo < 0) {
        this.limitTo = 3;
      }
      
      if(this.limitTo && this.locale[1].maximumFractionDigits){
        this.setLocaleOptions('maximumFractionDigits', this.limitTo);
      }
    } else {
      if (!this.limitTo && this.limitTo !== 0) {
        this.limitTo = Number.POSITIVE_INFINITY;
      }
    }
  }

  processInput(stringToProcess: string) {
    if (!stringToProcess) {
      this.setText(this.format ? this.format('') : '');
      if (!this.live) {
        this.test = new String('');
      }
      this.value = null;
      this.onChange(null);
      return;
    }
    // start processing string
    let sanitizedString = this.sanitize(stringToProcess);    
    this.groupsDelta = this.trackGroups(stringToProcess,this.text)?.delta;
    if (this.useString) {
      return this.processStringInput(sanitizedString);
    }
    //end processing string

    let number = this.limiter(sanitizedString);
    if(!sanitizedString || (!number&&number!==0)){
      if (this.format) {
        sanitizedString = this.format(sanitizedString);
      }
      this.setText(sanitizedString);
      if (!this.live) {
        this.test = new String(sanitizedString);
      }
      this.value = null;
      this.onChange(this.value);
      return
    }
    if (this.parseInt) {
      number = parseInt(sanitizedString);
    }
    number = this.checkBoundaries(number);
    let localeOptions = this.locale[1];

    //preserve fraction seperator while user is typing. for '2.' the decimal is stripped during type conversion
    if (sanitizedString.includes(this.fractionSeperator) && !this.minfractions && !this.parseInt) {
      localeOptions = localeOptions ? { ...localeOptions, minimumFractionDigits: 1 } : { minimumFractionDigits: 1 };
    }
    let processedString = Intl.NumberFormat(this.locale[0], localeOptions).format(number);
    if (this.format) {
      processedString = this.format(processedString);
    }
    this.setText(processedString);
    this.value = number;
    this.onChange(this.value);
    
    //need to limit the decimals of unformatted number manullay in !live mode. 
    if (!this.live) {
      let right = sanitizedString.split(this.fractionSeperator)[1];
      if (right?.length > this.limitTo) {
        right = right?.substring(0, this.limitTo);
      }
      let temp = this.value?.toString();
      if (sanitizedString.includes(this.fractionSeperator)) {
        temp = [this.value?.toString()?.split(this.fractionSeperator)[0], right].join(this.fractionSeperator);
      }
      this.test = new String(temp);
    }
    return;
  }
  trackGroups(currentText, previousText){
    const regex =  new RegExp(`[^\\${this.thousandsSeperator}]`, 'g');
    const countIncurrentText = currentText?.replace(regex,'')?.length ?? 0;
    const countInpreviousText = previousText?.replace(regex,'')?.length ?? 0;
    return {delta : countIncurrentText-countInpreviousText}
  }
  correctCaretForFormat(correctedPostion, minIntegerCorrection){
    if(!this.format){
      return correctedPostion
    }
    if(!this.value || !this.previousText || this.previousCursorPosition<=this.previousText?.search(/\d/)){
        if(!this.value&&this.minIntegers&&this.text.includes(this.fractionSeperator)){
          return this.text.indexOf(this.fractionSeperator)
        }
        return this.text.search(/\d/)+1
    }
    return correctedPostion
  }
  correctCaretForMinIntegers(correctedPostion){
    let minIntegerCorrection = false;

    if(!this.minIntegers || this.minIntegers<2||!this.live||this.useString){
      return {minIntegerCorrection,pos:correctedPostion}
    }
    const fractionSeperator = this.text.indexOf(this.fractionSeperator);
    if(this.correction){
      if(fractionSeperator>=0){
        correctedPostion = this.text.indexOf(this.fractionSeperator)
      }else{
        correctedPostion = this.text.length;
      }
      return {minIntegerCorrection,pos:correctedPostion};
    }
    if(this.previousCursorPosition==0){
      if(fractionSeperator&&!this.value){
        correctedPostion = fractionSeperator
        return {minIntegerCorrection,pos:correctedPostion}
      }
    }
    let previousFractionSeperator = this.previousText?.indexOf(this.fractionSeperator);
    if(previousFractionSeperator>=0 && this.previousCursorPosition <= previousFractionSeperator){
      const valueLeft =this.value?.toString()?.split(this.fractionSeperator)[0];
      const textLeft = this.previousText.split(this.fractionSeperator)[0]?.replace(/[^\d]/g,'');
      if(valueLeft?.length < textLeft?.length){
        minIntegerCorrection = true;
      }
      if(valueLeft?.length < textLeft?.length&&this.currentKey !== this.fractionSeperator){
        correctedPostion = this.previousCursorPosition;
      }
      if(this.currentKey == this.fractionSeperator){
        return{minIntegerCorrection, pos: fractionSeperator+1}
      }
    }
    
    return {minIntegerCorrection , pos:correctedPostion}
  }
  setText(textToRender: any) {
    let initPos;
    let pos;
    let diff = 0;
    pos = this.target?.selectionStart ?? 0;
    initPos = pos;
    this.hideCaret = true;
    if (textToRender !== this.text) {
      diff = textToRender?.split(this.regex).length - this.text?.split(this.regex).length;
      this.previousText = this.text_;
      this.text_ = new String(textToRender);
      if (diff) {
        pos += diff;
      }else if(this.groupsDelta>0){
        //user did not erase a group seperator so allow the natrual flow of caret
        pos = this.previousCursorPosition;
      }
      if(this.correction){
        pos = this.text.length; 
      }
      let minIntResponse = this.correctCaretForMinIntegers(pos);
      let minIntegerCorrection = minIntResponse?.minIntegerCorrection ? true:  false;
      pos = minIntResponse.pos;
      pos = this.correctCaretForFormat(pos,minIntegerCorrection);

    }
    if (pos||pos==0) {
      setTimeout(() => {
        if(this.correction){
          this.correction= false;
        }
        this.currentCursorPosition = pos;
        if(pos<0){
          pos=0
        }
        this.target?.setSelectionRange(pos, pos, 'none');
        this.hideCaret = false;
      });
    }else{
      this.hideCaret = false;
    }
  }
  limiter(sanitizedText: string): number {
    sanitizedText = sanitizedText?.replace(this.fractionSeperator, '.');
    if (sanitizedText.includes('.')) {
      sanitizedText = [sanitizedText.split('.')[0], sanitizedText.split('.')[1].substring(0, this.limitTo)].join('.');
    }
    let m = Number(sanitizedText);
    if (m > Number.MAX_SAFE_INTEGER || m < -Number.MAX_SAFE_INTEGER) {
      if (this.live) {
        return Number(this.sanitize(this.text_).replace(this.fractionSeperator, '.'));
      } else {
        let seperators = this.getLocaleSeperators(this.locale[0],this.live,this.locale);
        let temp = this.text_?.replace(new RegExp(`[^\\d${seperators.group}\\-]`, 'g'), '');
        temp = temp.replace(seperators.decimal, '.');
        return Number(temp);
      }
    }
    return m;
  }

  checkForSelection($event){
    if (this.target) {
      // mark for correction if text is selected
      if (this.target?.selectionStart !== this.target?.selectionEnd) {
        this.correction = true;
      }
      return;
    }
    this.target = $event.target;
  }
  onKeyDown(event) {
    this.hideCaret = false;
    if (event.key) {
      this.currentKey = event.key;
    }
    if (this.target) {
      // mark for correction if text is selected
      if (this.target?.selectionStart == this.target?.selectionEnd) {
        this.previousCursorPosition = this.target?.selectionStart;
      }
      return;
    }
    this.checkForSelection(event)
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
  sanitize(value: string): string{
    let text: any = `${value}`.replace(this.regex, '');
    text = this.processDecimals(text);
    return this.processNegatives(text);
  }

  checkBoundaries(number: number): any {
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

  processStringInput(text) {
    if (this.parseInt) {
      text = text?.split(this.fractionSeperator)[0];
    }
    text = this.checkBoundaries(text);
    text = text.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    let fraction = text.split(this.fractionSeperator)[1];
    if (fraction?.length) {
      let limit = this.limitTo;
      text = [text?.split(this.fractionSeperator)[0], text?.split(this.fractionSeperator)[1].substring(0, limit)].join(
        this.fractionSeperator
      );
    }
    let stringValue = text.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    if (this.format) {
      text = this.format(text);
    }
    this.setText(text);
    this.value = stringValue;
    this.onChange(this.value);
    return;
  }
  getLocaleSeperators(locale?, live?: boolean, localeFromInput?) {
    const {group, decimal}: any = new Intl.NumberFormat(locale).formatToParts(1234567.89).reduce((acc,r)=>{
      if(r.type == 'group'||r.type == 'decimal'){
        acc[r.type]  = r.value
      }
      return acc;
    },{});
    const regex = new RegExp(`[^\\d${decimal}\\-]`, 'g');
    if (live) {
      const {integer, fraction}: any = new Intl.NumberFormat(...localeFromInput).formatToParts(0).reduce((acc,r)=>{
        if(r.type == 'integer'||r.type == 'fraction'){
          acc[r.type]  = r.value
        }
        return acc;
      },{});
      const minIntegers = integer?.length;
      const minfractions = fraction?.length;
      return { group, decimal,minIntegers, minfractions, regex};
    }
    return { group, decimal,regex};
  }
}
