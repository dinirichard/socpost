import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {DayPilot} from "daypilot-pro-angular";
// import CalendarColumnData = DayPilot.CalendarColumnData;
import EventData = DayPilot.EventData;

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
    },
    {
      id: 2,
      start: DayPilot.Date.today().addDays(2),
      end: DayPilot.Date.today().addDays(2),
      text: "Event 2",
      // resource: "R1",
      barColor: "#6fa8dc"
    },
    {
      id: 3,
      start: DayPilot.Date.today().addDays(2),
      end: DayPilot.Date.today().addDays(2),
      text: "Event 3",
      // resource: "R2",
      barColor: "#f1c232"
    },
    {
      id: 4,
      start: DayPilot.Date.today().addDays(4),
      end: DayPilot.Date.today().addDays(4),
      text: "Event 4",
      // resource: "R3",
      barColor: "#6aa84f"
    },
    {
      id: 5,
      start: DayPilot.Date.today().addDays(6),
      end: DayPilot.Date.today().addDays(6),
      text: "Event 5",
      // resource: "R4",
      barColor: "#6fa8dc"
    },
    {
      id: 6,
      start: DayPilot.Date.today().addDays(10),
      end: DayPilot.Date.today().addDays(12),
      text: "Event 6",
      // resource: "R3",
      barColor: "#cc0000"
    },

  ];

  constructor(private http: HttpClient) {
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.events);
        observer.complete();
        }, 200);
    });

    // return this.http.get("/api/events?from=" + from.toString() + "&to=" + to.toString());
  }

}
