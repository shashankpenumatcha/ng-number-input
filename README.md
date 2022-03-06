# ng-number-input
    
> This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.0.

    A simple, WIP, locale aware number input. 

    It is a custom Angualr component built on top of html text input. 
    
    Built using ControlValueAccessor to support Angular forms API.
    
## Demo
Play around with the API on [StackBlitz](https://stackblitz.com/edit/angular-ivy-kqpxgd?devtoolsheight=33&file=src/app/app.component.html)


## Usage Instructions

1. run the following command to install the package to your application.

```
npm i ng-number-input --save 
```

2. Add **NgNumberInputModule** to the imports array of your module.

3. Use the below component selector in your templates.
```
<ng-number-input></ng-number-input>
```

## API

### Inputs

- **\[limitTo\]** 
    ```
    @Input() limitTo = 3;
    ```
    Limit the maximum number of values after the decimal point(radix).

    You can specify a value between 1 - 3

- **\[max\]** 
    ```
    @Input() max = 9007199254740992;
    ```
    maximum value the input can hold.

- **\[min\]** 
    ```
    @Input() min = -9007199254740992;
    ```
    minimum value the input can hold.

- **\[locale\]** 
    ```
    @Input() locale = ['en-US', {maximumFractionDigits:3}];
    ```
    Locale used to format the number. 
    
    It is an array and the first element is a string and the second one is an optional options object.

    Refer to [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString) for details on how to use them.


- **\[useString\]** 
    ```
    @Input() useString:boolean = false;
    ```
    If this value is set to true. The input will return string and Locale formatting is ignored.

    Formatting is done on string to add thousand seperators.

    Use the [format] function and [limitTo] to further format the text. 

- **\[format\]** 
    ```
    @Input() format;
    ```
    Use this function to format the displaying text value.

    You can pass a function which takes text and value as arguments.

    example:

    ```
    format(text:string, value:number){
        if(value>10000000){
        return 'Please a enter value less than 10000000'
        }
        return text
    }
 
    <ng-number-input
    [limitTo]="2"
    [(ngModel)]="test"
    [format]="format"
    required>
    </ng-number-input>
    ```

- **\[name\]** 
    ```
    @Input() name: string;
    ```
    Name attribute for the underlying input element.

- **\[placeholder\]** 
    ```
    @Input() placeholder: string = '';
    ```
    Placeholder attribute for the underlying input element.

- **\[customStyle\]** 
    ```
    @Input() customStyle: any = { height: '100%', width: '100%', border: 'none', outline: 'none', padding: '0px' };
    ```
    Add styles to the underlying html input element by passing as a json.

    Example:
    ```
    {
        height: '69px',
        width: '100%',
        maxWidth: '671px',
        margin: '0px auto',
        fontSize: '18px',
        left: '0px',
        padding: '0px 20px'
    }
    ```
- **\[parseInt\]** 
    ```
    @Input() parseInt = false;
    ```
    It is a boolean type input. If set to true decimals will be restricted. 

