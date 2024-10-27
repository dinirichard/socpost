import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {DayPilot} from "daypilot-pro-angular";
// import CalendarColumnData = DayPilot.CalendarColumnData;
import EventData = DayPilot.EventData;
import { ProvidersStore } from '../core/signal-states/providers.state';
import { Post, PostEventDTO } from '@socpost/libraries/nest/lib/dtos/posts/post.dto'
import { Provider } from '../models/provider.dto';
import { MediaDTO } from '../models/post.dto';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {

  events: EventData[] = [
    {
      id: 1,
      start: DayPilot.Date.today(),
      end: DayPilot.Date.today(),
      text: "Event 1",
      // resource: "R1",
      barColor: "#f1c232",
      height: 30,
      // backImage: '../../../public/instagram.png'
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${1}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${1}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },
    {
      id: 2,
      start: DayPilot.Date.today().addDays(2),
      end: DayPilot.Date.today().addDays(2),
      text: "Event 2",
      // resource: "R1",
      barColor: "#6fa8dc",
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${2}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${2}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },
    {
      id: 3,
      start: DayPilot.Date.today().addDays(2),
      end: DayPilot.Date.today().addDays(2),
      text: "Event 3",
      // resource: "R2",
      barColor: "#f1c232",
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${3}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${3}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },
    {
      id: 4,
      start: DayPilot.Date.today().addDays(4),
      end: DayPilot.Date.today().addDays(4),
      text: "Event 4",
      // resource: "R3",
      barColor: "#6aa84f",
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${4}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${4}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },
    {
      id: 5,
      start: DayPilot.Date.today().addDays(6),
      end: DayPilot.Date.today().addDays(6),
      text: "Event 5",
      // resource: "R4",
      barColor: "#6fa8dc",
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${5}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${5}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },
    {
      id: 6,
      start: DayPilot.Date.today().addDays(10),
      end: DayPilot.Date.today().addDays(12),
      text: "Event 6",
      // resource: "R3",
      barColor: "#cc0000",
      areas: [
        {
          bottom: 5,
          right: 5,
          width: 30,
          height: 30,
          action: "None",
          image: `https://picsum.photos/36/36?random=${6}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        },
        {
          bottom: 5,
          right: 2,
          width: 15,
          height: 15,
          action: "None",
          image: `https://picsum.photos/36/36?random=${6}`,
          style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
        }
      ]
    },

  ];

    baseUrl = "http://localhost:3000/api/posts";
    httpClient = inject(HttpClient);
    
    getPostEvents(orgId: string): Observable<PostEventDTO[]> {
        return this.httpClient.get<PostEventDTO[]>(`${this.baseUrl}/getPostsByOrg/${orgId}`);
    }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.events);
        observer.complete();
        }, 200);
    });
  }

  getPostForEdits(postId: string): Observable<[Post, Provider, MediaDTO[]]>  {
      console.log('postId: ', postId);
      return this.httpClient.get<[Post, Provider, MediaDTO[]]>(`${this.baseUrl}/getPostAndIntegration/${postId}`);
  }

}
