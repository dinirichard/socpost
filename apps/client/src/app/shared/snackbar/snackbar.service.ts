import { inject, Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import { ErrorSnackbarComponent } from './error-snackbar.component';
import { InfoSnackbarComponent } from './info-snackbar.component';
import { SuccessSnackbarComponent } from './success-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
    private _snackBar = inject(MatSnackBar);

    durationInSeconds = 500;

    openSnackbar(type: 'info' | 'success' | 'error' | string, message: string, action?: string){       
        switch (type) {
            case "info": return this.openInfoSnackBar(message, action);
                break;
            case "success": return this.openSuccessSnackBar(message, action);
                break;
            case "error": return this.openErrorSnackBar(message, action);
                break;
            default: return this.openInfoSnackBar(message, action);
        }
    }

    openErrorSnackBar(error: string, action?: string ) {
        return this._snackBar.openFromComponent(ErrorSnackbarComponent, {
            duration: this.durationInSeconds * 1000,
            data: { 
              message: error, 
              action, 
            },
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }


    openInfoSnackBar(message: string, action?: string ) {
      return this._snackBar.openFromComponent(InfoSnackbarComponent, {
          duration: this.durationInSeconds * 1000,
          data: { 
            message,
            action
          },
          horizontalPosition: 'right',
          verticalPosition: 'top',
      });
  }

    openSuccessSnackBar(message: string, action?: string ) {
        return this._snackBar.openFromComponent(SuccessSnackbarComponent, {
            duration: this.durationInSeconds * 1000,
            data: { 
              message, 
              action 
            },
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }

}
