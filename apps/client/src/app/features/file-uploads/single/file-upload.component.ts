import { Component, effect, inject, input, OnDestroy, output, signal, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { DragDropDirectiveModule } from "../drag-drop.directive";
import { MatProgressBarModule, ProgressBarMode } from "@angular/material/progress-bar";
import { FileUploadService } from "../file-upload.service";
import { Observable } from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { UploadService } from "../../../services/upload.service";
import { toast as superToast, toast } from 'bulma-toast';

@Component({
    selector: "app-file-upload",
    standalone: true,
    imports: [
        CommonModule, MatIconModule, 
        DragDropDirectiveModule, MatProgressBarModule
    ],
    providers: [FileUploadService],
    templateUrl: "./file-upload.component.html",
    styleUrl: "./file-upload.component.scss",
})
export class FileUploadComponent {

    uploadFile = output<File>();
    uploadError = output<string>();
    progress = signal(100);
    aspectRatio = input('16:9');
    sds = effect(() => {
        console.log(this.aspectRatio());
    });
    uploadComplete = false;

    selectedFiles?: FileList;
    currentFile?: File;
    progressMode: ProgressBarMode = 'query';
    message = '';
    fileInfos?: Observable<any>;

    constructor(
        private upService: UploadService
    ) { }

    files: any[] = [];

    /**
     * on file drop handler
     */
    onFileDropped($event: FileList) {
        console.log($event.item);
        // this.prepareFilesList($event);
    }

    /**
     * handle file from browsing
     */
    fileBrowseHandler(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const fileArray = Array.from(input.files);
            for (const item of fileArray) {
                if (item.type === 'video/mp4') {
                    this.getVideoDimensions(item).then(dimensions => {
                        console.log('Width:', dimensions.width);
                        console.log('Height:', dimensions.height);
                        const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                        console.log('aspectRatio:', aspectRatio);
                        if (aspectRatio === this.aspectRatio()) {
                            this.prepareFilesList(item);
                        } else {
                            console.log('aspectRatio:', aspectRatio);
                            this.toaster(`The video must have ${this.aspectRatio()} aspect ratio.`, 'is-danger');
                        }
                      });
                } else {
                    console.log('YouTube accepts only mp4 video formats', item.type);
                    this.toaster('YouTube accepts only mp4 video formats', 'is-danger');
                }
            }
            // this.prepareFilesList(input.files);
        }

    }

    /**
     * Delete file from files list
     * @param index (File index)
     */
    deleteFile(index: number) {
        this.files.splice(index, 1);
    }

    /**
     * Convert Files list to normal array list
     * @param files (Files List)
     */
    prepareFilesList(item: File) {
        this.files.push(item);
        this.currentFile = item;
        console.log(this.currentFile, 'This is the file');
        if ((item.size / (1 * 1024 * 1024)) < 10 ) {
            this.uploadFile.emit(this.currentFile);
            this.upService.simpleImageUpload(item)
            .then(
                (event: any) => {
                    console.log( event, 'event');
                    this.progressMode = 'determinate';
                    this.uploadComplete = true;
                    this.toaster('The file has been uploaded!', 'is-success');
                },
                (err: any) => {
                    console.log(err);
                    this.toaster('Could not upload the file!', 'is-danger');
                    this.progressMode = 'determinate';
                    this.progress.set(0);
                    this.currentFile = undefined;
                    
                    if (err.error && err.error.message) {
                      this.toaster(err.error.message, 'is-success');
                    }
                
                }
            );
        } else {
            this.uploadFile.emit(this.currentFile);
            this.upService.largeMediaUpload(item)
            .then(
                (event: any) => {
                    console.log( event, 'event');
                    this.progressMode = 'determinate';
                    this.uploadComplete = true;
                    this.toaster('The file has been uploaded!', 'is-success');
                },
                (err: any) => {
                    console.log(err);
                    this.toaster('Could not upload the file!', 'is-danger');
                    this.progressMode = 'determinate';
                    this.progress.set(0);
                    this.currentFile = undefined;
                  
                    if (err.error && err.error.message) {
                      this.toaster(err.error.message, 'is-success');
                    }
                }
            )
        }
    //   this.uploadFilesSimulator(0);
    }

    /**
        * format bytes
        * @param bytes (File size in bytes)
        * @param decimals (Decimals point)
    */
    formatBytes(bytes: number, decimals: number) {
        if (bytes === 0) {
          return '0 Bytes';
        }
        const k = 1024;
        const dm = decimals <= 0 ? 0 : decimals || 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getVideoDimensions(videoFile: File): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata'; // Load only metadata
      
            video.onloadedmetadata = () => {
              resolve({
                width: video.videoWidth,
                height: video.videoHeight
              });
            };
      
            video.onerror = () => {
              reject(null); // Or reject with an error object
            };
      
            video.src = URL.createObjectURL(videoFile); 
          });
    }

    getImageDimensions(file: File): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = e.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
    }

    getAspectRatio(width: number, height: number): string {
        const gcd = (a: number, b: number): number => {
            return b === 0 ? a : gcd(b, a % b);
        };
    
        const divisor = gcd(width, height);
        const aspectWidth = width / divisor;
        const aspectHeight = height / divisor;
    
        return `${aspectWidth}:${aspectHeight}`;
    }

    toaster(message: string, type: any) {
        toast({
            message: message,
            type: type,
            dismissible: true,
            animate: { in: 'fadeIn', out: 'fadeOut' },
            position: 'top-right',
            duration: 1500,
            pauseOnHover: true,
          });
    }
}
