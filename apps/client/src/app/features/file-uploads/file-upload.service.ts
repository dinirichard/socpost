import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpProgressEvent, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import * as crypto from 'crypto';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
    httpClient = inject(HttpClient);
    baseUrl = "http://localhost:3000/api/media";

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    console.log( file, 'Form Data');
    const orgId = localStorage.getItem("orgId");
    const req = new HttpRequest('POST', `${this.baseUrl}/uploadMedia/${orgId}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.httpClient.request(req);
  }

  uploadMultiple(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file);
    const orgId = localStorage.getItem("orgId");
    // for (let i = 0; i < files.length; i++) {
    //   formData.append('files', files[i], files[i].name);
    // }

    return this.httpClient.post(`${this.baseUrl}/uploadMedia/${orgId}`, formData, {
      'reportProgress': true,
      'headers': {
        'Content-Type': 'multipart/form-data',
      }
    }).pipe(
      map((event: any) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return Math.round((100 * event.loaded) / (event.total ?? 1));
          case HttpEventType.Response:
            return 100;
          default:
            return 0;
        }
      })
    );
  }

  getFiles(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/files`);
  }

  async multiPart(file: File) {

      let uploadId;
      let key;
      const hash = await this.getFileHash(file);

      await this.createMultipartUpload( file, hash, file.type).subscribe((response: any) => {
        uploadId = response.uploadID;
        key = response.key;
        console.log( uploadId, 'uploadId');
        console.log( key, 'key');
      });
      const parts = [];
      // let presignedUrls: string[] = [];

      for (let partNumber = 1; partNumber <= Math.ceil(file.size / 5 * 1024 * 1024); partNumber++) {
        const start = (partNumber - 1) * 5 * 1024 * 1024;
        const end = Math.min(partNumber * 5 * 1024 * 1024, file.size);
        console.log(`Part Number from start ${start} to end ${end}`);
        const blob = file.slice(start, end);

        let presignedUrl; 
        await this.getPresignedUrl(uploadId, key, partNumber).subscribe((response: any) => {
          presignedUrl = response.url;
          console.log( presignedUrl, 'presignedUrl');
        });
        if (presignedUrl) {
            await fetch(presignedUrl, {
              method: 'PUT',
              body: blob,
            });
          }      

        parts.push({ ETag: 'etag', PartNumber: partNumber });
      }

      return this.completeMultipartUpload(key, uploadId, parts).toPromise();
  }

  createMultipartUpload(file: File, fileHash: any, contentType: any) {
    return this.httpClient.post(`${this.baseUrl}/multi/create-multipart-upload`, {
      file,
      fileHash,
      contentType
    });
  }

  getPresignedUrl(uploadId: any, key: any, partNumber: number) {
    return this.httpClient.post(`${this.baseUrl}/multi/sign-part`, { uploadId, key, partNumber });
  }

  completeMultipartUpload(key: any, uploadId: any, parts: any[]) {
    return this.httpClient.post(`${this.baseUrl}/multi/complete-multipart-upload`, { key, uploadId, parts }, {
      reportProgress: true
    });
  }

  async getFileHash(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const fileData = event.target.result;
        const hash = crypto.createHash('sha256').update(fileData).digest('hex');
        resolve(hash);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

}
