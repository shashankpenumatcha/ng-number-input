import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NgNumberInputService {

  constructor() { }
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
