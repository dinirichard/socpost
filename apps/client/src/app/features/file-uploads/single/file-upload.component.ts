import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { DragDropDirectiveModule } from "../drag-drop.directive";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { FileUploadService } from "../file-upload.service";
import { Observable } from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";

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

    selectedFiles?: FileList;
    currentFile?: File;
    progress = signal(0);
    message = '';
    fileInfos?: Observable<any>;

    constructor(private uploadService: FileUploadService) { }

    files: any[] = [];

    /**
     * on file drop handler
     */
    onFileDropped($event: FileList) {
        console.log($event);
        this.prepareFilesList($event);
    }

    /**
     * handle file from browsing
     */
    fileBrowseHandler(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.prepareFilesList(input.files);
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
     * Simulate the upload process
     */
    // uploadFilesSimulator(index: number) {
    //   setTimeout(() => {
    //     if (index === this.files.length) {
    //       return;
    //     } else {
    //       const progressInterval = setInterval(() => {
    //         if (this.files[index].progress === 100) {
    //           clearInterval(progressInterval);
    //           this.uploadFilesSimulator(index + 1);
    //         } else {
    //           this.files[index].progress += 5;
    //         }
    //       }, 200);
    //     }
    //   }, 1000);
    // }

    /**
     * Convert Files list to normal array list
     * @param files (Files List)
     */
    prepareFilesList(files: FileList) {
    const fileArray = Array.from(files);
        for (const item of fileArray) {
            this.files.push(item);
            this.currentFile = item;
            console.log(this.currentFile, 'This is the file');
            if ((item.size / (1 * 1024 * 1024)) < 10 ) {
                this.uploadService.upload(item).subscribe(
                    (event: any) => {
                        console.log( event, 'event');
                        if (event.type === 1) {
                            this.progress.set(Math.round(100 * event.loaded / event.total));
                            console.log( this.progress(), 'progress');
                        } else if (event instanceof HttpResponse) {
                            // this.message = event.body.message;
                            // this.fileInfos = this.uploadService.getFiles();
                        }
                    },
                    (err: any) => {
                      console.log(err);
                      this.progress.set(0);
                    
                      if (err.error && err.error.message) {
                        this.message = err.error.message;
                      } else {
                        this.message = 'Could not upload the file!';
                      }
                    
                      this.currentFile = undefined;
                    }
                );
            } else {
                this.uploadService.multiPart(item).then(
                    (event: any) => {
                        if (event.type === HttpEventType.UploadProgress) {
                            this.progress.set(Math.round(100 * event.loaded / event.total));
                        } else if (event instanceof HttpResponse) {
                            this.message = event.body.message;
                            // this.fileInfos = this.uploadService.getFiles();
                        }
                    },
                    (err: any) => {
                      console.log(err);
                      this.progress.set(0);
                    
                      if (err.error && err.error.message) {
                        this.message = err.error.message;
                      } else {
                        this.message = 'Could not upload the file!';
                      }
                    
                      this.currentFile = undefined;
                    }
                )
            }
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
}
