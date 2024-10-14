import { Component, effect, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule, ProgressBarMode } from "@angular/material/progress-bar";
import { DragDropDirectiveModule } from "../drag-drop.directive";
import { Observable } from "rxjs";
import { SnackbarService } from "../../../shared/snackbar/snackbar.service";
import { UploadService } from "../../../services/upload.service";

type FilePrev = { file: File; preview: string; };

@Component({
    selector: "app-image-upload",
    standalone: true,
    imports: [
        CommonModule, MatIconModule, 
        DragDropDirectiveModule, MatProgressBarModule
    ],
    templateUrl: "./image-upload.component.html",
    styleUrl: "./image-upload.component.scss",
})
export class ImageUploadComponent {
    snackbarService = inject(SnackbarService);

    uploadFile = output<any>();
    uploadError = output<string>();

    multiple = input(false);
    aspectRatio = input('16:9');
    fileFormats = input(['image/jpeg']);
    sizeLimit = input(2);

    progress = signal(100);
    sds = effect(() => {
        console.log(this.aspectRatio());
    });
    uploadComplete = false;

    selectedFiles?: FileList;
    currentFile?: File;
    progressMode: ProgressBarMode = 'query';
    message = '';
    fileInfos?: Observable<any>;
    files: FilePrev[] = [];
    imagePreview = signal({});

    uploadSuccess = false;
    uploadErrors = false;

    constructor(
        private upService: UploadService
    ) { }

    /**
     * on file drop handler
     */
    onFileDropped($event: FileList) {
        const fileArray = Array.from($event);
        for (const item of fileArray) {
            if (this.fileFormats().includes(item.type)) {
                // this.prepareFilesList(item);
                // this.getImageDimensions(item).then(dimensions => {
                //     const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                //     if (aspectRatio === this.aspectRatio()) {
                        this.prepareFilesList(item);
                    // } else {
                    //     console.log('aspectRatio:', aspectRatio);
                    //     this.snackbarService.openSnackbar('error', `The video must have ${this.aspectRatio()} aspect ratio.`);
                    // }
                // });
            } else {
                console.log('YouTube accepts only mp4 video formats', item.type);
                this.snackbarService.openSnackbar('error', `This file format ${item.type} is not supported`);
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
                if (this.fileFormats().includes(item.type)) {
                //     this.getImageDimensions(item).then(dimensions => {
                //         const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                //         if (aspectRatio === this.aspectRatio()) {
                            this.prepareFilesList(item);
                    //     } else {
                    //         this.snackbarService.openSnackbar('error', `The video must have ${this.aspectRatio()} aspect ratio.`);
                    //     }
                    // });
                } else {
                    console.log('YouTube accepts only mp4 video formats', item.type);
                    this.snackbarService.openSnackbar('error', `This file format ${item.type} is not supported`);
                }
            }
        }
    }

    /**
     * Convert Files list to normal array list
     * @param files (Files List)
     */
    prepareFilesList(item: File) {
        this.currentFile = item;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.set(e.target?.result as string); // Set image preview URL
            this.files.push({file: item, preview: e.target?.result as string});
            console.log('Files push', this.files);
        };
        reader.readAsDataURL(item);

        if ((item.size / (1 * 1024 * 1024)) < this.sizeLimit() ) {
            
            this.upService.simpleImageUploadS3(item)
            .subscribe(
                (event: any) => {
                    console.log( event, 'event');
                    this.uploadFile.emit(event);
                    const temp = event.path.replace(/\\/g, "\\");
                    event.path = temp;
                    this.imagePreview.set(event);
                    this.uploadComplete = true;
                    this.snackbarService.openSnackbar('success', 'The video has been uploaded! 😥🙌');
                },
                (err: any) => {
                    console.log(err);
                    this.snackbarService.openSnackbar('error', 'There was an error uploading video');
                    this.progress.set(0);
                    this.currentFile = undefined;
                    
                    if (err.error && err.error.message) {
                        this.snackbarService.openSnackbar('error', err.error.message);
                    }
                }
            );
        } else {
            this.snackbarService.openSnackbar('error', `This image is larger than the image limit (${this.sizeLimit()} MB) for the provider.`);
        }
    }

    deleteFile(item: FilePrev) {
        console.log('File List', this.files);
        this.files = this.files.filter((file) => file.file.name !== item.file.name); 
        this.imagePreview.set('');
        console.log('File List', this.files);
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
}
