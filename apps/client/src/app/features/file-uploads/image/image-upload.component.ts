import { Component, effect, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule, ProgressBarMode } from "@angular/material/progress-bar";
import { DragDropDirectiveModule } from "../drag-drop.directive";
import { Observable } from "rxjs";

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
    multiple = input(false);

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
    files: FilePrev[] = [];
    imagePreview = signal('');

    uploadSuccess = false;
    uploadErrors = false;

    /**
     * on file drop handler
     */
    onFileDropped($event: FileList) {
        const fileArray = Array.from($event);
        for (const item of fileArray) {
            if (item.type.startsWith('image/')) {
                this.prepareFilesList(item);
                // this.getImageDimensions(item).then(dimensions => {
                //     console.log('Width:', dimensions.width);
                //     console.log('Height:', dimensions.height);
                //     const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                //     console.log('aspectRatio:', aspectRatio);
                //     if (aspectRatio === this.aspectRatio()) {
                //         this.prepareFilesList(item);
                //     } else {
                //         console.log('aspectRatio:', aspectRatio);
                //         // this.toaster(`The video must have ${this.aspectRatio()} aspect ratio.`, 'is-danger');
                //     }
                // });
            } else {
                console.log('YouTube accepts only mp4 video formats', item.type);
                // this.toaster('YouTube accepts only mp4 video formats', 'is-danger');
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
                if (item.type.startsWith('image/')) {
                    this.prepareFilesList(item);
                    return;
                    // this.getImageDimensions(item).then(dimensions => {
                    //     console.log('Width:', dimensions.width);
                    //     console.log('Height:', dimensions.height);
                    //     const aspectRatio = this.getAspectRatio(dimensions.width, dimensions.height);
                    //     console.log('aspectRatio:', aspectRatio);
                    //     if (aspectRatio === this.aspectRatio()) {
                    //         this.prepareFilesList(item);
                    //     } else {
                    //         console.log('aspectRatio:', aspectRatio);
                    //         // this.toaster(`The video must have ${this.aspectRatio()} aspect ratio.`, 'is-danger');
                    //     }
                    // });
                } else {
                    console.log('YouTube accepts only mp4 video formats', item.type);
                    return;
                    // this.toaster('YouTube accepts only mp4 video formats', 'is-danger');
                }
            }
            // this.prepareFilesList(input.files);
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
        console.log('Reader', reader.result);

        if ((item.size / (1 * 1024 * 1024)) < 10 ) {
            // this.uploadFile.emit(this.currentFile);
            // this.upService.simpleImageUpload(item)
            // .then(
            //     (event: any) => {
            //         console.log( event, 'event');
            //         this.progressMode = 'determinate';
            //         this.uploadComplete = true;
            //         this.toaster('The file has been uploaded!', 'is-success');
            //     },
            //     (err: any) => {
            //         console.log(err);
            //         this.toaster('Could not upload the file!', 'is-danger');
            //         this.progressMode = 'determinate';
            //         this.progress.set(0);
            //         this.currentFile = undefined;
                    
            //         if (err.error && err.error.message) {
            //           this.toaster(err.error.message, 'is-success');
            //         }
                
            //     }
            // );
        } else {
            // this.uploadFile.emit(this.currentFile);
            // this.upService.largeMediaUpload(item)
            // .then(
            //     (event: any) => {
            //         console.log( event, 'event');
            //         this.progressMode = 'determinate';
            //         this.uploadComplete = true;
            //         this.toaster('The file has been uploaded!', 'is-success');
            //     },
            //     (err: any) => {
            //         console.log(err);
            //         this.toaster('Could not upload the file!', 'is-danger');
            //         this.progressMode = 'determinate';
            //         this.progress.set(0);
            //         this.currentFile = undefined;
                  
            //         if (err.error && err.error.message) {
            //           this.toaster(err.error.message, 'is-success');
            //         }
            //     }
            // );
        }
    //   this.uploadFilesSimulator(0);
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
