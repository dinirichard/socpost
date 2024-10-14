import { Component, effect, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { DragDropDirectiveModule } from "../drag-drop.directive";
import { MatProgressBarModule, ProgressBarMode } from "@angular/material/progress-bar";
import { FileUploadService } from "../file-upload.service";
import { Observable } from "rxjs";
import { UploadService } from "../../../services/upload.service";
import { SnackbarService } from "../../../shared/snackbar/snackbar.service";

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
    snackbarService = inject(SnackbarService);

    uploadFile = output<any>();
    uploadError = output<string>();
    progress = signal(100);
    aspectRatio = input('16:9');
    sds = effect(() => {
        console.log(this.aspectRatio());
    });
    uploadComplete = false;
    uploadStart = signal(true);

    currentFile?: File;
    progressMode: ProgressBarMode = 'query';

    constructor(
        private upService: UploadService
    ) { }

    files: any[] = [];

    /**
     * on file drop handler
     */
    onFileDropped($event: FileList) {
        const fileArray = Array.from($event);
        for (const item of fileArray) {
            if (item.type === 'video/mp4') {
                this.getVideoDimensions(item).then(dimensions => {
                    const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                    if (aspectRatio === this.aspectRatio()) {
                        this.prepareFilesList(item);
                    } else {
                        console.log('aspectRatio:', aspectRatio);
                        this.snackbarService.openSnackbar('error', `The video must have ${this.aspectRatio()} aspect ratio.`);
                    }
                });
            } else {
                console.log('YouTube accepts only mp4 video formats', item.type);
                this.snackbarService.openSnackbar('error', 'YouTube accepts only mp4 video formats');
            }
        }
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
                        const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                        if (aspectRatio === this.aspectRatio()) {
                            this.prepareFilesList(item);
                        } else {
                            console.log('aspectRatio:', aspectRatio);
                            this.snackbarService.openSnackbar('error', `The video must have ${this.aspectRatio()} aspect ratio.`);
                        }
                    });
                } else {
                    console.log('YouTube accepts only mp4 video formats', item.type);
                    this.snackbarService.openSnackbar('error', 'YouTube accepts only mp4 video formats');
                }
            }
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
        this.uploadStart.set(true);
        this.files.push(item);
        this.currentFile = item;
        console.log(this.currentFile, 'This is the file');
        if ((item.size / (1 * 1024 * 1024)) < 10 ) {
            this.upService.simpleImageUploadS3(item)
            .subscribe(
                (event: any) => {
                    console.log( event, 'event');
                    this.uploadFile.emit(event);
                    this.progressMode = 'determinate';
                    this.uploadComplete = true;
                    this.snackbarService.openSnackbar('success', 'The video has been uploaded! 😥🙌');
                },
                (err: any) => {
                    console.log(err);
                    this.snackbarService.openSnackbar('error', 'There was an error uploading video');
                    this.progressMode = 'determinate';
                    this.progress.set(0);
                    this.uploadStart.set(false);
                    this.currentFile = undefined;
                    
                    if (err.error && err.error.message) {
                        this.snackbarService.openSnackbar('error', err.error.message);
                    }
                
                }
            );
        } else {
            this.upService.largeMediaUploadS3(item).then((res) => {
                if (res !== undefined) {
                    this.upService.saveMediaData(res.orgId, res.originalName, res.uploadUrl, res.fileType)
                        .subscribe((res) => {
                            console.log( res, 'event');
                            this.uploadFile.emit(res);
                            this.progressMode = 'determinate';
                            this.uploadComplete = true;
                            this.snackbarService.openSnackbar('success', 'The video has been uploaded! 😥🙌');
                        },
                        (err: any) => {
                            console.log(err);
                            this.snackbarService.openSnackbar('error', 'There was an error uploading video');
                            this.progressMode = 'determinate';
                            this.progress.set(0);
                            this.uploadStart.set(false);
                            this.currentFile = undefined;
                          
                            if (err.error && err.error.message) {
                                this.snackbarService.openSnackbar('error', err.error.message);
                            }
                        }
                    );
                } else {
                    this.snackbarService.openSnackbar('error', 'There was an error uploading video');
                }
            });
        }
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

    getAspectRatio(width: number, height: number): string {
        const gcd = (a: number, b: number): number => {
            return b === 0 ? a : gcd(b, a % b);
        };
    
        const divisor = gcd(width, height);
        const aspectWidth = width / divisor;
        const aspectHeight = height / divisor;
    
        return `${aspectWidth}:${aspectHeight}`;
    }
}
