export interface Post {
    id?            : string;      
    state?         : string;
    content?       : string;
    group?         : string;
    title?         : string;
    description?   : string;
    releaseId?     : string;
    releaseUrl?    : string;
    settings?       : string;
    image?          : string;
    video?          : string;
    videoKind?     : string;
    forKids?       : boolean;
    approval       : string;
    publishDate    : any;    
    organizationId : string;
    provider?       : string;
    integrationId  : string;
    tags?           : Tag[];
  }

export class PostDTO {
    
}

  export interface Tag {
    id?: string;
    name: string;
  }