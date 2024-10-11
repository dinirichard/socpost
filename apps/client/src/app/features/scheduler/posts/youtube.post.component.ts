import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Input, model, OnInit, output, signal, ViewChild, viewChild } from "@angular/core";
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
import {MatRadioModule} from '@angular/material/radio';
import { explicitEffect } from "ngxtension/explicit-effect";
import { FileUploadComponent } from "../../file-uploads/video/file-upload.component";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbTimepickerModule, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Post } from "../../../models/post.dto";
import { ProvidersStore } from "../../../core/signal-states/providers.state";
import {DayPilot} from "daypilot-pro-angular";
import MonthTimeRangeSelectedArgs = DayPilot.MonthTimeRangeSelectedArgs;
import { Tag } from "@prisma/client";
import { TagsInputComponent } from "../../../components/tags-input/tags-input.component";
import { ImageUploadComponent } from "../../file-uploads/image/image-upload.component";
import { CustomValidators } from "../../../shared/validators/time.validator";
import { MatDividerModule } from "@angular/material/divider";
// import { ToastTemplatesComponent } from "../../../shared/toast/toast-templates.component";


@Component({
    standalone: true,
    imports: [
        CommonModule, MatDialogModule,
        FormsModule, MatFormFieldModule,
        ReactiveFormsModule, FileUploadComponent,
        ImageUploadComponent,
        MatInputModule, MatSidenavModule, 
        MatIconModule, MatButtonModule,
        MatProgressBarModule, MatSliderModule,
        MatButtonToggleModule, MatCheckboxModule,
        MatRadioModule, MatSliderModule,
        NgbTimepickerModule, TagsInputComponent,
        MatDividerModule
    ],
    providers: [ ProvidersStore ],
    templateUrl: "./youtube.post.html",
    styleUrl: "./youtube.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePostComponent implements OnInit {
    activeModal = inject(NgbActiveModal);
    readonly store = inject(ProvidersStore);

    videoMedia = viewChild<ElementRef<HTMLVideoElement>>('video');
    videoSlider = signal(0);
    videoElement: HTMLVideoElement | undefined;
    multipleImages = signal(false);
    

    // constructor( ) {
    // }
    uploadComplete = signal(false);
    aspectRatio = signal('16:9');
    uploadedFile: File | undefined = undefined;

    sideNavWidth = '80%';
    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
    });
    collasped = signal(false);
    computedCollasped = computed(() => this.collasped() ? '70px' : '250px');
    sideNavWidthOutput = output<string>();

    timeSpinners = false;
    calenderArgs = new Date(this.store.calenderArgs()!);
    timeControl = new FormControl<NgbTimeStruct | null>(null, CustomValidators.TimeValidator);

    tagsAvailable: Tag[] = [
      {id: 'dfdfdf', name: 'video'},
      {id: 'hjklhuu', name: 'short'},
    ];
    formPageControl = new FormControl('details');
    videoKindControl = new FormControl('video');
    postDetails = new FormGroup({
        title: new FormControl('', {validators: Validators.required}),
        description: new FormControl('', {validators: Validators.required}),
        videoKind: new FormControl('video', {validators: Validators.required}),
        videoMediaId: new FormControl('', {validators: Validators.required}),
        thumbnailMediaId: new FormControl('', {validators: Validators.required}),
        forKids: new FormControl(false, {validators: Validators.required}),
        tags: new FormControl([{ id: 'unknown', name: 'unknown'}], {validators: Validators.required}),
    });
    
    sds = effect( () => {
      console.log(this.computedCollasped());
      this.computedCollasped()
      this.sideNavWidthOutput.emit(this.computedCollasped())
    });

    ngOnInit() {
        // this.dialogRef.updateSize('1000px', '90%');
        console.log('Store', this.store.calenderArgs());


        //* Implement to complete Tags Input
        //* const { tags } = this.dataService.fetchInfo();
        const tags = [
            {id: 'dfdfdf', name: 'video'},
            {id: 'hjklhuu', name: 'short'},
        ];

        // this.tagsAvailable = tags.map(({ id, name }) => {
        //   return {
        //     id,
        //     name
        //   };
        // });
    }

    videodd = explicitEffect([this.videoSlider], ([videoSlider], cleanup) => {
        console.log('videoSlider updated', this.videoSlider());
      
        this.videoElement = this.videoMedia()?.nativeElement;
            console.log(this.videoElement);
            if ( this.videoElement) {
                console.log(this.videoElement.currentTime);
                console.log(this.videoElement.currentTime);
                console.log(this.videoElement.duration);
                console.log(this.videoElement.readyState);
                // if (!this.videoMedia.readyState) return;
                // this.videoMedia()?.nativeElement.controls = true;
                this.videoElement.currentTime = this.videoElement.duration * this.videoSlider();
                // this.videoSlider > 1 ? this.videoElement.play() : console.log('dsd');
            }

        cleanup(() => {
            console.log('cleanup');
        });
    });

    getUploadedFile(file: File) {
      this.uploadedFile = file;
      console.log(this.uploadedFile, 'Uploaded File');
      this.postDetails.get('title')?.setValue(file.name);
      this.postDetails.get('videoKind')?.setValue(this.videoKindControl.value);
      console.log(this.postDetails.value);
      this.activeModal.update({ 
        size: 'xl',
      });
    }

    toggleSection(sectionId: string) {
        const section = document.getElementById(sectionId);
        section?.classList.toggle('collapsed');
      
        const otherSectionId = sectionId === 'section1' ? 'section2' : 'section1';
        const otherSection = document.getElementById(otherSectionId);
        otherSection?.classList.remove('collapsed');
    }
      
      toggleNav() {
        const sidenav = document.getElementById("mySidenav");
        const mainContent = document.querySelector('.main-content');
        
        sidenav?.classList.toggle("active");
        mainContent?.classList.toggle("active");
      }

      toggleVideoKind() {
          this.videoKindControl.value === 'short' 
            ? this.aspectRatio.set('9:16') 
            : this.aspectRatio.set('16:9')
      }

      formatLabel(value: number): string {
        if (value >= 1000) {
          return Math.round(value / 1000) + 'k';
        }
        return `${value}`;
      }

      public onAddTag(event: Tag[]) {
        console.log(event);
        this.postDetails.get('tags')?.setValue(event);
      }

      onSubmit(){
        if (this.timeControl.valid && this.timeControl.value){
            this.calenderArgs.setHours(this.timeControl.value?.hour, this.timeControl.value?.minute);
        }

        const tags = this.postDetails.get('tags')?.value || [];

        console.log('Form Tags', this.postDetails.get('tags')?.value);

        // const post: Post = {
        //   organizationId: this.store.orgId(),
        //   publishDate: this.store.calenderArgs(),
        //   integrationId: this.store.selectedProvider()?.id || '',
        //   approval: 'YES',
        //   title: this.postDetails.get('title')?.value || '',
        //   description: this.postDetails.get('description')?.value || '',
        //   videoKind: this.postDetails.get('videoKind')?.value || '',
        //   forKids: this.postDetails.get('forKids')?.value || false,
        //   tags: tags,
        // }

        // this.activeModal.close(post);
      }

      onClose() {
        this.activeModal.close();
      }
      
    
}
