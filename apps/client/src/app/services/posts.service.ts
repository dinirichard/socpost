import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../models/post.dto';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  httpClient = inject(HttpClient);
  baseUrl = "http://localhost:3000/api/posts";

  createPost(post: Post) {
    return this.httpClient.post(`${this.baseUrl}/savePost`, post);
  }

}
