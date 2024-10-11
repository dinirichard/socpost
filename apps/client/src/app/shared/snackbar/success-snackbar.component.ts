import { Component, Inject, inject, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction, MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "app-success-snackbar",
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, 
        MatSnackBarLabel, MatSnackBarActions, 
        MatSnackBarAction, MatIcon
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="snackbar-container">
            <span class="example-pizza-party" matSnackBarLabel>
                {{data.message}}
            </span>
            <span matSnackBarActions>
                <button mat-button matSnackBarAction (click)="snackBarRef.dismissWithAction()">
                    <mat-icon [style.color]="'red'">cancel</mat-icon>
                </button>
            </span>
        </div>
    `,
    styles: `
        .mat-mdc-snack-bar-container .mat-mdc-snackbar-surface {
            // color: var(--mat-app-inverse-on-surface);
            // border-radius: var(--mdc-snackbar-container-shape);
            // background-color: var(--mat-app-inverse-surface);
            box-shadow: -6px 5px 5px 2px lightgreen ;
        }
        .snackbar-container {
            display: flex;
        }
    `,
})
export class SuccessSnackbarComponent {
    snackBarRef = inject(MatSnackBarRef);
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string; action?: string; }) { }

        
}
