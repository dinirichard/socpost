import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, output, signal, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
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
import { Tag } from "@prisma/client";
import { ProvidersStore } from "../../../core/signal-states/providers.state";
import {DayPilot} from "daypilot-pro-angular";
import MonthTimeRangeSelectedArgs = DayPilot.MonthTimeRangeSelectedArgs;
import { TagsInputComponent } from "../../../components/tags-input/tags-input.component";
import { ImageUploadComponent } from "../../file-uploads/image/image-upload.component";
import { CustomValidators } from "../../../shared/validators/time.validator";
import { MatDividerModule } from "@angular/material/divider";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatTooltipModule} from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { PostsService } from "../../../services/posts.service";


@Component({
    standalone: true,
    imports: [
        CommonModule, MatDialogModule,
        FormsModule, MatFormFieldModule,
        ReactiveFormsModule, FileUploadComponent,
        ImageUploadComponent, MatDividerModule,
        MatInputModule, MatSidenavModule, 
        MatIconModule, MatButtonModule,
        MatProgressBarModule, MatSliderModule,
        MatButtonToggleModule, MatCheckboxModule,
        MatRadioModule, MatSliderModule,
        NgbTimepickerModule, TagsInputComponent,
        MatProgressSpinnerModule, MatTooltipModule
    ],
    providers: [ ProvidersStore ],
    templateUrl: "./youtube.post.html",
    styleUrl: "./youtube.post.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePostComponent implements OnInit {
    activeModal = inject(NgbActiveModal);
    readonly store;
    postService = inject(PostsService)

    videoMedia = viewChild<ElementRef<HTMLVideoElement>>('video');
    videoSlider = signal(0);
    videoElement: HTMLVideoElement | undefined;
    multipleImages = signal(false);
    sizeLimit = signal(2);
    imageFormats = signal(['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif']);
    

    
    uploadComplete = signal(false);
    aspectRatio = signal('16:9');
    uploadedVideo: any | undefined = undefined;
    uploadedImage: any | undefined = undefined;

    sideNavWidth = '80%';
    sideNavCollapsed = computed(() => {
        return (this.sideNavWidth === '70px')
    });
    collasped = signal(false);
    computedCollasped = computed(() => this.collasped() ? '70px' : '250px');
    sideNavWidthOutput = output<string>();

    timeSpinners = false;
    calenderArgs : Date;
    timeControl : FormControl;

    progressValue = 0;


    tagsAvailable: Tag[] = [
      {id: 'dfdfdf', name: 'video'},
      {id: 'hjklhuu', name: 'short'},
    ];
    formPageControl : FormControl;
    videoKindControl : FormControl;
    title : FormControl;
    description : FormControl;
    forKids : FormControl;
    tags: FormControl;

    
    tagsValidSignal;
    tagsCheck = false;
    titleValidSignal;
    titleCheck = false;
    descValidSignal;
    descCheck = false;
    timeValidSignal
    timeCheck = false;

    constructor( ) {
      this.store = inject(ProvidersStore);
      // this.store.readFromStorage();
      
      this.calenderArgs = new Date(this.store.calenderArgs());
      this.timeControl = new FormControl<NgbTimeStruct | null>(null, CustomValidators.TimeValidator);
      this.formPageControl = new FormControl('details');
      this.videoKindControl = new FormControl('video');
      this.title = new FormControl('', {validators: Validators.required});
      this.description = new FormControl('', {validators: Validators.required});
      this.forKids = new FormControl(false, {validators: Validators.required});
      this.tags = new FormControl([{ id: '', name: 'video'}], {validators: Validators.required});

      this.tagsValidSignal = toSignal(this.tags.valueChanges);
        this.tagsCheck = false;
        this.titleValidSignal = toSignal(this.title.valueChanges);
        this.titleCheck = false;
        this.descValidSignal = toSignal(this.description.valueChanges);
        this.descCheck = false;
        this.timeValidSignal = toSignal(this.timeControl.valueChanges);
        this.timeCheck = false;

        
        effect(() => {
            this.timeValidSignal();
            if (this.timeControl.valid && !this.timeCheck) { this.addProgress(); this.timeCheck = !this.timeCheck; } 
            if (this.timeControl.invalid && this.timeCheck) {this.substractProgress(); this.timeCheck = !this.timeCheck; }
          }
        );
        effect(() => {
              this.titleValidSignal(); 
              if (this.title.valid && !this.titleCheck) { this.addProgress(); this.titleCheck = !this.titleCheck; } 
            if (this.title.invalid && this.titleCheck) {this.substractProgress(); this.titleCheck = !this.titleCheck; }
          }
        );
        effect(() => {
            this.descValidSignal(); 
            if (this.description.valid && !this.descCheck) { this.addProgress(); this.descCheck = !this.descCheck; } 
            if (this.description.invalid && this.descCheck) {this.substractProgress(); this.descCheck = !this.descCheck; }
          }
        );
        effect(() => {
              this.tagsValidSignal();
              if (this.tags.valid && !this.tagsCheck) { this.addProgress(); this.tagsCheck = !this.tagsCheck; } 
            if (this.tags.invalid && this.tagsCheck) {this.substractProgress(); this.tagsCheck = !this.tagsCheck; }
          }
        );


      const postProvider = this.store.selectedPost();
      if(postProvider !== undefined) {
          this.timeControl.setValue({ hour: this.calenderArgs.getHours(), minute: this.calenderArgs.getMinutes(), second: 0 });
          this.videoKindControl.setValue(postProvider.videoKind);
          this.title.setValue(postProvider.title);
          this.description.setValue(postProvider.description);
          this.forKids.setValue(postProvider.forKids);
          this.tags.setValue(postProvider.tags);

          this.getUploadedVideo(this.store.postMedia().find((media) => postProvider.video === media.id));
          this.getUploadedThumbnail(this.store.postMedia().find((media) => postProvider.image === media.id));
          this.activeModal.update({ 
            size: 'xl',
          });
          this.addProgress();
          this.addProgress();
      }
    }

    addProgress() {
      this.progressValue = this.progressValue + 12.5;
    }
    substractProgress() {
      this.progressValue = this.progressValue - 12.5;
    }
    
    sds = effect( () => {
      this.computedCollasped();
      this.sideNavWidthOutput.emit(this.computedCollasped());
    });

    ngOnInit() {
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

    getUploadedVideo(file: any) {
      if (!file) {
        return;
      }
      this.uploadedVideo = file;
      this.progressValue = this.progressValue + 12.5;
      this.title.setValue(file.name);
      this.videoKindControl.setValue(this.videoKindControl.value);
      this.activeModal.update({ 
        size: 'xl',
      });
    }

    getUploadedThumbnail(file: any) {
      if (!file) {
        return;
      }
      this.uploadedImage = file;
      this.uploadedImage.path = this.uploadedImage.path.replace(/\\/g, "\\",);
      this.progressValue = this.progressValue + 12.5;
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
        this.tags.setValue(event);
      }

      onSubmit(){
        if (this.timeControl.valid && this.timeControl.value){
            this.calenderArgs.setHours(this.timeControl.value?.hour, this.timeControl.value?.minute);
        }

        const tags = this.tags.value || [];

        console.log('Form Tags', this.tags.value);

        const post: Post = {
          organizationId: this.store.orgId(),
          publishDate: this.calenderArgs,
          integrationId: this.store.selectedProvider()?.id || '',
          approval: 'YES',
          title: this.title.value || '',
          description: this.description.value || '',
          videoKind: this.videoKindControl.value || '',
          forKids: this.forKids.value || false,
          tags: tags,
          video: this.uploadedVideo.id,
          image: this.uploadedImage.id,
          provider: this.store.selectedProvider()?.providerIdentifier,
        }

        this.postService.createPost(post).subscribe((res) => {
          console.log('Post result', res);
        });
        // this.activeModal.close(post);
      }

      onDraft(){
        if (this.timeControl.valid && this.timeControl.value){
            this.calenderArgs.setHours(this.timeControl.value?.hour, this.timeControl.value?.minute);
        }

        const tags = this.tags.value || [];

        console.log('Form Tags', this.tags.value);

        const post: Post = {
          organizationId: this.store.orgId(),
          publishDate: this.store.calenderArgs(),
          integrationId: this.store.selectedProvider()?.id || '',
          approval: 'AWAITING_CONFIRMATION',
          videoKind: this.videoKindControl.value || '',
          forKids: this.forKids.value || false,
          video: this.uploadedVideo.id,
          provider: this.store.selectedProvider()?.providerIdentifier
        };
        
        if (this.uploadedImage) { post.image = this.uploadedImage.id; }
        if (this.tags.valid) { post.tags = this.tags.value || []; }
        if (this.title.valid) { post.image = this.title.value || ''; }
        if (this.description.valid) { post.description = this.description.value || ''; }
        
        this.postService.createPost(post).subscribe((res) => {
          console.log('Post result', res);
        });
      }

      onClose() {
        this.store.clearMedia();
        this.store.clearCalendarArgs();
        this.store.clearSelectedProvider();
        this.store.clearSelectedPostEvent();
        // this.store.writeToStorage();
        this.activeModal.close();
      }
      
    
}
