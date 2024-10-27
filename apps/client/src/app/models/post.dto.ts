import {DayPilot} from "daypilot-pro-angular";
import EventData = DayPilot.EventData;
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
    id: string;
    name: string;
}

export interface TagDTO {
  id: string;
  name: string;
}

export class PostEvent {
    id: string;
    start: DayPilot.Date;
    end: DayPilot.Date;
    text: string;
    barColor: string;
    areas: {
        bottom: number;
        right: number;
        width: number;
        height: number;
        action: string;
        image: string;
        style: string;
    }[] = [];


    constructor(id: string, date: Date, 
      title: string, profileImg: string, provider: string ) 
    {
        this.id = id;
        this.start = new DayPilot.Date(date);
        this.end = new DayPilot.Date(date);
        this.text = title;
        this.barColor = this.getBarcolor(provider);
        this.areas.push({
            bottom: 5,
            right: 5,
            width: 30,
            height: 30,
            action: "None",
            image: profileImg,
            style: "border-radius: 50%; border: 1px solid #fff; overflow: hidden;",
        });
        this.areas.push({
            bottom: 5,
            right: 2,
            width: 20,
            height: 20,
            action: "None",
            image: `${provider}.png`,
            style: "overflow: hidden;",
        })
    } 

    getBarcolor(provider: string) {
      switch (provider) {
        case "youtube":
            return "#ff3d00";
        case "reddit":
            return "#f26322";
        case "twitterx":
            return "#000000";
        case "linkedin":
            return "#0288d1";
        case "instagram":
            return "#8a2be2";
        case "pinterest":
            return "#ff3d00";
        case "facebook":
            return "#3f51b5";
        default:
            return "#ff3d00";
      }
    }

    getAsEvent() {
        return {
          id : this.id,
          start : this.start,
          end : this.end.addHours(1),
          text: this.text,
          barColor: this.barColor,
          areas: this.areas,
      } as EventData;
    }
}

export interface MediaDTO {
  id: string;
  name: string;
  path: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}