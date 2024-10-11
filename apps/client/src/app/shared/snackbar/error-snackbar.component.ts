import { Component, Inject, inject, signal, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction, MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "app-error-snackbar",
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, 
        MatSnackBarLabel, MatSnackBarActions, 
        MatSnackBarAction, MatIcon,
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="snackbar-container">
                <span class="example-pizza-party" matSnackBarLabel>
                    {{data.message}}
                </span>
                <span matSnackBarActions>
                    <button mat-icon-button  matSnackBarAction (click)="snackBarRef.dismissWithAction()">
                        <mat-icon [style.color]="darkMode() ? 'var(--sys-error)' : 'var(--sys-error)'">cancel</mat-icon>
                    </button>
                </span>

        </div>
        
    `,
    styles: `
        .mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
            
            color: var(--sys-on-error-container);
            // border-radius: var(--mdc-snackbar-container-shape);
            background-color: var(--sys-error-container);
            box-shadow: -6px 5px 5px 2px var(--sys-error);
        }
        .snackbar-container {
            display: flex;
        }
    `,
})
export class ErrorSnackbarComponent {
    snackBarRef = inject(MatSnackBarRef);
    darkMode = signal(document.documentElement.classList.contains('dark'));
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string; action?: string; }) {
     }


}
