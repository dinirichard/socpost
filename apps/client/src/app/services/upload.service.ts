import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

import { environment } from '../../environments/environment';
import { makeId } from "@socpost/libraries/nest/lib/services/make.is";
import { abortMultipartUpload, completeMultipartUpload, createMultipartUpload, signPart, simpleUpload } from "@socpost/libraries/nest/lib/upload/r2.uploader";

@Injectable({
  providedIn: 'root'
})
export class UploadService {
    httpClient = inject(HttpClient);
    baseUrl = "http://localhost:3000/api/media";
    // constructor() { }

    upload(file: File){
      const formData: FormData = new FormData();
  
      formData.append('file', file);
      console.log( file, 'Form Data');
      const orgId = localStorage.getItem("orgId");
  
      return this.httpClient.post(`${this.baseUrl}/uploadMedia/${orgId}`, formData, {
        reportProgress: true,
        responseType: 'json'
      });
    }

    simpleImageUploadS3(file: File): Observable<any> {
        const key = makeId(10);
        const orgId = localStorage.getItem("orgId");
        const newFileName = key + '.' + file.type.split('/').at(-1);
        const uploadUrl = environment.CLOUDFLARE_BUCKET_URL + '/' + newFileName;
        
        const upload = simpleUpload(file, newFileName, file.type);  
        console.log('upload', upload);
        return this.httpClient.post(`${this.baseUrl}/saveUploads`, {
          orgId,
          originalName: file.name,
          uploadUrl,
          fileType: file.type
        });
    }

    saveMediaData(orgId: string | null, originalName: string, uploadUrl: string, fileType: string): Observable<any> {
      return this.httpClient.post(`${this.baseUrl}/saveUploads`, {
        orgId,
        originalName,
        uploadUrl,
        fileType
      });
    }

    async largeMediaUploadS3(file: File) {
      const hash = await this.getFileHash(file);
      const orgId = localStorage.getItem("orgId");

      const { uploadId, key } = await createMultipartUpload( {file, fileHash: hash, contentType: file.type});
      const parts = [];
      const uploadUrl = environment.CLOUDFLARE_BUCKET_URL + '/' + key;
      const totalParts = Math.ceil(file.size / (5 * 1024 * 1024));

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * (5 * 1024 * 1024);
        const end = Math.min(partNumber * (5 * 1024 * 1024), file.size);
        const blob = file.slice(start, end);

        try {
            const presignedUrl = await signPart({uploadId, key, partNumber});
            if (presignedUrl) {
                const response = await fetch(presignedUrl, {
                  method: 'PUT',
                  body: blob,
                });
                const etag = response.headers.get('ETag'); 
                parts.push({ ETag: etag, PartNumber: partNumber });
            }     
              
        } catch (error) {
          console.error(`Error uploading part ${partNumber}:`, error);
          abortMultipartUpload({ key, uploadId });
          return undefined;
        }
      }
      
      try {
          await completeMultipartUpload({key, uploadId, parts});
          console.log('completed multipart');
          return {
              orgId,
              originalName: file.name,
              uploadUrl,
              fileType: file.type
          };
      } catch (err) {
          console.log('Error', err);
          abortMultipartUpload({ key, uploadId });
          return undefined;
      }

    }
  
    async getFileHash(file: File): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const fileData = event.target.result;
          const wordArray = CryptoJS.lib.WordArray.create(fileData); 
          const hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    }
}
