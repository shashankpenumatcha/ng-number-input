
# ng-number-input

Angualr form input that adds group and fraction separators to numbers as you type.  

Built on top of `HTML text input`  using `ControlValueAccessor` to support Angular forms API.

Formatting is mostly done using the `Intl.NumberFormat`.


## Demo
![enter image description here](https://github.com/shashankpenumatcha/ng-number-input/blob/main/gif.gif?raw=true)

Play around with the API on [StackBlitz](https://stackblitz.com/edit/angular-ivy-kqpxgd?file=src/app/app.component.html).

  
  

## Usage Instructions

1. run the following command in your application's root directory to install the package.

	```

	npm i ng-number-input --save

	```

  

2. Add `NgNumberInputModule` to the imports array of your module.

  

3. Use the below component selector in your templates.

	```

	<ng-number-input></ng-number-input>

	```

  

## API

  

### Inputs

  - **\[mode\]**
	```

	@Input() mode: string= 'default';

	```
	This component runs in one of three modes, `defualt`, `lazy` and `string`.
	
	`default`: 
	    
	  - As the name suggests, this is the default mode.  In this mode the numbers are automatically formatted while the user is typing.
	  
	  - The values are stored as `number` and can only lie between  negative `Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.
	  

	`string`: 
	    
	  - In this mode the numbers are automatically formatted while the user is typing.
	  
	  - The values are stored as string and there is no limit on the number it can hold.
	  
	  -  The formatting is done using `regex` in this mode. So `[locale]` input is not supported. The default formatting is done like `'en-US'`.

	`lazy`: 
		    
	  - In this mode plain numbers are displayed while user is interacting with the input and formatted number is displayed once user stops the interaction.
	  
	  - The values are stored as `number` and can only lie between  negative `Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.
	  
		

-  **\[locale\]**

	```

	@Input() locale = ['en-US', {maximumFractionDigits:3}];

	```

	The locale used to format the number.	It is an array and the first element is a string and the second one is an options object.
	
	Refer to the documentation on [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)  for  more details.

	This input is ignored in `string` mode.
	>Note: All locales and locale options are not supported in all modes.  Please try out the demo with your preferred locale options. More locales and locale options will be supported in future and you are welcome to contribute.  
	

-  **\[limitTo\]**

	```

	@Input() limitTo: number = 3;

	```

	Limit the maximum number of values after the decimal point(radix).	You can specify a value between 1 - 3


	This input overrides `maximumFractionDigits`  in `locale` options.

	  
-  **\[max\]**

	```

	@Input() max: number;

	```

	maximum value the input can hold. It is capped at `Number.MAX_SAFE_INTEGER`.
	
  

-  **\[min\]**

	```

	@Input() min:number;

	```

	minimum value the input can hold. It is capped at `-Number.MAX_SAFE_INTEGER`.

 

-  **\[format\]**

	```

	@Input() format;

	```

	Use this function to format the displaying text value.	You can pass a function which takes text as arguments.
	
	>Note: Do not use digits, fraction separators and group separators while formatting.
	  

		example:

		  

		```

		format(text:string): string{

		return '$' + text

		}

		<ng-number-input

		[limitTo]="2"

		[(ngModel)]="test"

		[format]="format"

		required>

		</ng-number-input>

		```

	  

-  **\[name\]**

	```

	@Input() name: string;

	```

	Name attribute for the underlying input element.

	  

-  **\[placeholder\]**

	```

	@Input() placeholder: string = '';

	```

	Placeholder attribute for the underlying input element.

	  

-  **\[customStyle\]**

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

-  **\[parseInt\]**

	```

	@Input() parseInt:boolean = false;

	```

	It is a boolean type input. If set to true decimals will be restricted.

  
  

## Source Code

> This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.0.
  
