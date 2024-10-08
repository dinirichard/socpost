import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators {
    static MatchValidator(source: string, target: string) {
        return (control: AbstractControl): ValidationErrors | null => {
            const sourceCtrl = control.get(source);
            const targetCtrl = control.get(target);

            return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
                ? { mismatch: true }
                : null;
        };
    }
}
