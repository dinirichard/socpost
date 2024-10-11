import { FormControl, ValidationErrors } from "@angular/forms";
import { NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";


export class CustomValidators {
    static TimeValidator() {
        return (control: FormControl<NgbTimeStruct | null>): ValidationErrors | null => {
            const value = control.value;
        
            if (!value) {
              return null; // No time selected, no validation needed
            }
        
            // Your validation logic here (example)
            if (value.hour < 8) {
              return { tooEarly: true };
            } else if (value.hour > 18) {
              return { tooLate: true };
            }
        
            return null; // Time is valid
        };
    }
}