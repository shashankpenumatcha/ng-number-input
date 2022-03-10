import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberInput'
})
export class NgNumberInputPipe implements PipeTransform {

  transform(value: string): any {
    return value + "RUssia"
  }

}
