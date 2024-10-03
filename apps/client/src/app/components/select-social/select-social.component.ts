import { Component, ChangeDetectionStrategy, inject, model } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


export interface DialogSocialData {
    social: string;
    title: string;
  }

@Component({
    selector: 'app-select-social-dialog',
    templateUrl: './select-social-dialog.html',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    styleUrl: './select-social-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SelectSocialDialogComponent {
    readonly dialogRef = inject(MatDialogRef<SelectSocialDialogComponent>);
    readonly data = inject<DialogSocialData>(MAT_DIALOG_DATA);
    readonly social = model(this.data.social);
  
    onSelectSocial(social: string): void {
      this.data.social = social;
      this.dialogRef.close(this.data);
    }
  }