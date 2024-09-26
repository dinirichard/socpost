import { ChangeDetectionStrategy, Component, computed, effect, inject, model, OnInit, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { DialogCalPostData } from "../scheduler.component";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { explicitEffect } from "ngxtension/explicit-effect";
import { ModalService } from "ngx-modal-ease";
import { FileUploadComponent } from "../../file-uploads/single/file-upload.component";


@Component({
    standalone: true,
    imports: [
        CommonModule, MatDialogModule,
        FormsModule, MatFormFieldModule,
        ReactiveFormsModule, FileUploadComponent,
        MatInputModule, MatSidenavModule, 
        MatIconModule, MatButtonModule,
        MatProgressBarModule, MatSliderModule,
        MatButtonToggleModule, MatCheckboxModule
    ],
    templateUrl: "./youtube.post.html",
    styleUrl: "./youtube.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePostComponent implements OnInit {
    modalService = inject(ModalService);
    // constructor( private modalService: ModalService) {
    // }
    // readonly dialogRef = inject(MatDialogRef<YoutubePostComponent>);
    // readonly data = inject<DialogCalPostData>(MAT_DIALOG_DATA);
    // readonly calArgs = model(this.data.calenderArgs);

    // dialogRef.updateSize("300px", "300px");

    sideNavWidth = '80%';

    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
    });

    collasped = signal(false);
    computedCollasped = computed(() => this.collasped() ? '70px' : '250px');
    sideNavWidthOutput = output<string>();

    formPageControl = new FormControl('details');
    
    videoDetails = new FormGroup({
        title: new FormControl('', {validators: Validators.required}),
        description: new FormControl('', {validators: Validators.required}),
        videoKind: new FormControl('video', {validators: Validators.required}),


    })
    
    sds = effect( () => {
      console.log(this.computedCollasped());
      this.computedCollasped()
      this.sideNavWidthOutput.emit(this.computedCollasped())
    });

    ngOnInit() {
        // this.dialogRef.updateSize('1000px', '90%');
        console.log();
    }

    toggleSection(sectionId: string) {
        const section = document.getElementById(sectionId);
        section?.classList.toggle('collapsed');
      
        const otherSectionId = sectionId === 'section1' ? 'section2' : 'section1';
        const otherSection = document.getElementById(otherSectionId);
        otherSection?.classList.remove('collapsed');
      }

    //   toggleNave = effect(() => {
    //     this.formPageControl.value;
    //     const sidenav = document.getElementById("mySidenav");
    //     const mainContent = document.querySelector('.main-content');
        
    //     sidenav?.classList.toggle("active");
    //     mainContent?.classList.toggle("active");
    //   });

    //   animateFormSwitch = explicitEffect([], ([this.formPageControl]) => {
    //     switchForm
    //         ? animate(this.authList().nativeElement, { x: "0%" }, { duration: 1 })
    //         : animate(this.authList().nativeElement, { x: "-50%" }, { duration: 1 });
    // });
      
      toggleNav() {
        const sidenav = document.getElementById("mySidenav");
        const mainContent = document.querySelector('.main-content');
        
        sidenav?.classList.toggle("active");
        mainContent?.classList.toggle("active");
      }

      onClose() {
        // this.modalService.modalInstances
        this.modalService.close(this.videoDetails.value);
      }

    
}
