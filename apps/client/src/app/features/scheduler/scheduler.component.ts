import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, model, OnInit, output, Signal, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {DayPilot, DayPilotModule, DayPilotCalendarComponent, DayPilotMonthComponent } from "daypilot-pro-angular";
import { SchedulerService} from "../../services/scheduler.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MatDialogModule
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { YoutubePostComponent } from './posts/youtube.post.component';

export interface DialogSocialData {
  social: string;
}

export interface DialogCalPostData {
  calenderArgs: any;
}

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    DayPilotModule,
    MatIconModule,
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatDialogModule
  ],
  providers: [SchedulerService],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerComponent 
  implements AfterViewInit 
  {
  collasped = signal(false);
  computedCollasped = computed(() => this.collasped() ? '70px' : '250px');
  sideNavWidthOutput = output<string>();
  
  // ngOnInit(): void {   
  // }

  sds = effect( () => {
    console.log(this.computedCollasped());
    this.computedCollasped()
    this.sideNavWidthOutput.emit(this.computedCollasped())
  });


  @ViewChild("calendar")
  calendar!: DayPilotCalendarComponent;
  
  @ViewChild("monthCal")
  monthCalender!: DayPilotMonthComponent;

  events: any[] = [];

  monthConfig: DayPilot.MonthConfig ={
    locale: "en-us",
    viewType: "Weeks",
    weeks: 4,
    cellHeight: 70,
    eventHeight: 50,
    showWeekend: true,
    timeRangeSelectedHandling: "Enabled",
    theme: 'calendar_green',
    onTimeRangeSelected: async (args) => {
      // const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      const selectedSocial = await this.openSocialDialog();
      const calendar = args.control;

      if(this.social()) {
        const socialPost = this.openYoutubeDialog(args);
      }
      console.log(selectedSocial)
      calendar.clearSelection();
      // if (modal.canceled) { return; }
      // calendar.events.add({
      //   start: args.start,
      //   end: args.end,
      //   id: DayPilot.guid(),
      //   text: modal.result
      // });
    },
    eventDeleteHandling: "Update",
    onEventDeleted: (args) => {
      console.log("Event deleted: " + args.e.text());
    },
    eventMoveHandling: "Update",
    onEventMoved: (args) => {
      console.log("Event moved: " + args.e.text());
    },
    eventResizeHandling: "Disabled",
    eventClickHandling: "Select",
    onEventSelected: (args) => {
      console.log(`Event ${args.e.id().toString()} was ${args.selected}`)
      args.selected;
    },
    eventHoverHandling: "Bubble",
    bubble: new DayPilot.Bubble({
      onLoad: (args) => {
        // if the event object doesn't specify "bubbleHtml" property
        // this onLoad handler will be called to provide the bubble HTML
        args.html = "Event details";
      }
    }),
    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: (args) => { const dp = args.source.calendar; dp.events.remove(args.source); } }
      ]
    }),
  };

  config: DayPilot.CalendarConfig = {
    viewType: "Week",
    headerDateFormat: "ddd d/M/yyyy",
    columnWidthSpec: "Fixed",
    columnWidth: 120,
    cellHeight: 50,
    cellDuration: 60,
    crosshairType: "Full",
    eventArrangement: "SideBySide",
    timeRangeSelectedHandling: "Enabled",
    theme: 'calendar_green',
    onTimeRangeSelected: async (args) => {
      const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      const calendar = args.control;
      calendar.clearSelection();
      if (modal.canceled) { return; }
      calendar.events.add({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: modal.result
      });
    },
    eventDeleteHandling: "Update",
    onEventDeleted: (args) => {
      console.log("Event deleted: " + args.e.text());
    },
    eventMoveHandling: "Update",
    onEventMoved: (args) => {
      console.log("Event moved: " + args.e.text());
    },
    eventResizeHandling: "Disabled",
    onEventResized: (args) => {
      console.log("Event resized: " + args.e.text());
    },
    eventClickHandling: "Select",
    onEventSelected: (args) => {
      console.log(args.selected);
    },
    eventHoverHandling: "Bubble",
    bubble: new DayPilot.Bubble({
      onLoad: (args) => {
        // if the event object doesn't specify "bubbleHtml" property
        // this onLoad handler will be called to provide the bubble HTML
        args.html = "Event details";
      }
    }),
    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: (args) => { 
          const dp = args.source.calendar; 
          dp.events.remove(args.source); } 
        }
      ]
    }),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
  };

  constructor(private ds: SchedulerService) {
  }

  ngAfterViewInit(): void {
    const from = this.monthCalender.control.visibleStart();
    const to = this.monthCalender.control.visibleEnd();
    this.ds.getEvents(from, to).subscribe(result => {
      this.events = result;
    });
  }

  onBeforeEventRender(args: any) {
    const dp = args.control;
    args.data.areas = [
      {
        top: 3,
        right: 3,
        width: 20,
        height: 20,
        symbol: "/public/daypilot.svg#minichevron-down-2",
        fontColor: "#fff",
        toolTip: "Show context menu",
        action: "ContextMenu",
      },
      {
        top: 3,
        right: 25,
        width: 20,
        height: 20,
        symbol: "/public/daypilot.svg#x-circle",
        fontColor: "#fff",
        action: "None",
        toolTip: "Delete event",
        onClick: async (args: any)   => {
          dp.events.remove(args.source);
        }
      }
    ];

    args.data.areas.push({
      bottom: 5,
      left: 5,
      width: 36,
      height: 36,
      action: "None",
      image: `https://picsum.photos/36/36?random=${args.data.id}`,
      style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
    });
}



  readonly dialog = inject(MatDialog);
  social = signal('');

  async openSocialDialog() {
    const dialogRef = this.dialog.open(SelectSocialDialogComponent, {
      data: {social: this.social()},
    });

    await dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.social.set(result.social);
        console.log(`Dialog result: ${result.social}`);
      }
    });
  }

  openYoutubeDialog(args: any) {
    const dialogRef = this.dialog.open(YoutubePostComponent, {
      data: { calenderArgs: args },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.social.set(result.social)
      console.log(`Dialog result: ${result.social}`);
    });
  }
}


@Component({
  selector: 'app-select-social-dialog',
  templateUrl: './select-social-dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  styleUrl: './select-social-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSocialDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SelectSocialDialogComponent>);
  readonly data = inject<DialogSocialData>(MAT_DIALOG_DATA);
  readonly social = model(this.data.social);

  onSelectSocial(social: string): void {
    this.data.social = social;
    this.dialogRef.close(this.data);
  }
}