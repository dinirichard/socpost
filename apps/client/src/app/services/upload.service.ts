import { HttpClient, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { makeId } from "@socpost/libraries/nest/lib/services/make.is";
import { abortMultipartUpload, completeMultipartUpload, createMultipartUpload, signPart, simpleUpload } from "@socpost/libraries/nest/lib/upload/r2.uploader";
import { map, Observable } from 'rxjs';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';

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
      // const req = new HttpRequest('POST', `${this.baseUrl}/uploadMedia/${orgId}`, formData, {
      //   reportProgress: true,
      //   responseType: 'json'
      // });
  
      return this.httpClient.post(`${this.baseUrl}/uploadMedia/${orgId}`, formData, {
        reportProgress: true,
        responseType: 'json'
      });
    }

    async simpleImageUploadS3(file: File) {
        const key = makeId(10);
        const upload = await simpleUpload(file, key, file.type);
      
        const orgId = localStorage.getItem("orgId");
      
        const uploadUrl = environment.CLOUDFLARE_BUCKET_URL + '/' + key + '.' + file.type.split('/').at(-1);
      
        return this.httpClient.post(`${this.baseUrl}/saveUploads`, {
          orgId,
          originalName: key,
          uploadUrl,
          fileType: file.type
      });
    }

    async largeMediaUploadS3(file: File) {
      const hash = await this.getFileHash(file);
      const orgId = localStorage.getItem("orgId");

      const { uploadId, key } = await createMultipartUpload( {file, fileHash: hash, contentType: file.type});
      const parts = [];
      // let presignedUrls: string[] = [];
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
          break; // Exit the loop if there's an error
        }
      }
      console.log(parts, 'Parts')
      try {
          const res = completeMultipartUpload({key, uploadId, parts});
          return this.httpClient.post(`${this.baseUrl}/saveUploads`, {
            orgId,
            originalName: file.name,
            key,
            fileType: file.type
          });
      } catch (err) {
          console.log('Error', err);
          return abortMultipartUpload({ key, uploadId });
          throw new Error();
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
