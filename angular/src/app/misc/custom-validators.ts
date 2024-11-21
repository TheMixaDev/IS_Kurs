import {AbstractControl, ValidationErrors, Validators} from "@angular/forms";

export class CustomValidators {
  public static noWhitespace() {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : {pattern: true};
    }
  }
}
