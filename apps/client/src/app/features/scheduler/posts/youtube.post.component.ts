import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { DialogCalPostData } from "../scheduler.component";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

@Component({
    standalone: true,
    imports: [
        CommonModule, MatDialogModule,
        FormsModule, MatFormFieldModule,
        MatInputModule, 
    ],
    templateUrl: "./youtube.post.html",
    styleUrl: "./youtube.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePostComponent {
    readonly dialogRef = inject(MatDialogRef<YoutubePostComponent>);
    readonly data = inject<DialogCalPostData>(MAT_DIALOG_DATA);
    readonly calArgs = model(this.data.calenderArgs);

    
}
