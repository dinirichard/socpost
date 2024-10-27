import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, output, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {DayPilot, DayPilotModule, DayPilotCalendarComponent, DayPilotMonthComponent, DayPilotNavigatorComponent } from "daypilot-pro-angular";
import MonthTimeRangeSelectedArgs = DayPilot.MonthTimeRangeSelectedArgs;
import MonthEventClickedArgs = DayPilot.MonthEventClickedArgs;
import EventData = DayPilot.EventData;
import { SchedulerService} from "../../services/scheduler.service";
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { YoutubePostComponent } from './posts/youtube.post.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectConnectionDialogComponent } from '../../components/select-connection/select-connection-dialog.component';
import { ProvidersStore } from '../../core/signal-states/providers.state';
import { Provider } from '../../models/provider.dto';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {OverlayModule} from '@angular/cdk/overlay';



export interface DialogCalPostData {
  calenderArgs: any;
}

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    DayPilotModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, 
    MatInputModule, FormsModule, 
    MatDialogModule, MatButtonToggleModule,
    OverlayModule, ReactiveFormsModule
  ],
  providers: [SchedulerService, ProvidersStore ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerComponent 
  implements 
  AfterViewInit 
  //, OnInit
  {
  readonly store;
  snackbarService = inject(SnackbarService);
  collasped = signal(false);
  computedCollasped = computed(() => this.collasped() ? '70px' : '250px');
  sideNavWidthOutput = output<string>();
  modalService = inject(NgbModal);
  navigationOpen = signal(false);
  
  // ngOnInit(): void {   
  // }

  sds = effect( () => {
    console.log(this.computedCollasped());
    this.computedCollasped()
    this.sideNavWidthOutput.emit(this.computedCollasped())
  });

  
  @ViewChild("day") day!: DayPilotCalendarComponent;
  @ViewChild("week") week!: DayPilotCalendarComponent;
  @ViewChild("navigator") nav!: DayPilotNavigatorComponent;
  @ViewChild("monthCal") monthCalender!: DayPilotMonthComponent;
  calendarStyleToggle = new FormControl('Month');
  navDetail = signal('Navigation');

  events = signal<EventData[]>([]);
  date = DayPilot.Date.today();

  monthConfig: DayPilot.MonthConfig ={
    locale: "en-us",
    viewType: "Month",
    // weeks: 4,
    cellHeight: 70,
    eventHeight: 50,
    showWeekend: true,
    timeRangeSelectedHandling: "Enabled",
    theme: 'calendar_green',
    
    onTimeRangeSelected: async (args: MonthTimeRangeSelectedArgs) => {
      // const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      // const selectedSocial = await this.openSocialDialog(args);
      this.openSocialDialog(args);
      this.store.addCalendarArgs(args.start.toDate());
      // await this.openYoutubeDialog(args);
      const calendar = args.control;

      // if(this.social()) {
      //   const socialPost = this.openYoutubeDialog(args);
      // }
      // console.log(selectedSocial)
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
    eventClickHandling: "Enabled",
    onEventClicked: (args: MonthEventClickedArgs) => {
      console.log(`Event ${args.e.id().toString()} was clicked: ${args.ctrl}`)
      this.onEventSelected(args);
    },
    // onEventSelected: (args: MonthEventSelectedArgs) => {
    //   console.log(`Event ${args.e.id().toString()} was selected: ${args.selected}`)
    //   args.selected;
    // },
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

  configNavigator: DayPilot.NavigatorConfig = {
    showMonths: 1,
    // cellWidth: 25,
    // cellHeight: 25,
    orientation: "Vertical",
    rowsPerMonth: "Auto",
    selectMode: "Month",
    // onVisibleRangeChanged: args => {
    //   this.loadEvents();
    // }
  };

  // loadEvents(): void {
  //   const from = this.nav.control.visibleStart();
  //   const to = this.nav.control.visibleEnd();
  //   // this.ds.getEvents(from, to).subscribe(result => {
  //   //   this.events = result;
  //   // });
  // };

  changeDate(date: DayPilot.Date): void {
      this.configDay.startDate = date;
      this.configWeek.startDate = date;
      this.monthConfig.startDate = date;
      if (this.calendarStyleToggle.value === 'Month') {
        this.navDetail.set(this.monthConfig.startDate.toDate().toLocaleDateString('en-GB', {month: 'long'}));
      }

      if (this.calendarStyleToggle.value === 'Week') {
        this.navDetail.set('Navigation');
      }

      if (this.calendarStyleToggle.value === 'Day') {
        this.navDetail.set('Navigation');
      }
      console.log('Month: ', this.monthConfig.startDate.toDate().toLocaleDateString('en-GB', {month: 'long'}));
      // this.navigationOpen.set(false);
  };

  viewDay():void {
      this.configNavigator.selectMode = "Day";
      this.configDay.visible = true;
      this.configWeek.visible = false;
      this.monthConfig.visible = false;
  }

  viewWeek():void {
    this.configNavigator.selectMode = "Week";
    this.configDay.visible = false;
    this.configWeek.visible = true;
    this.monthConfig.visible = false;
  }

  viewMonth():void {
    this.configNavigator.selectMode = "Month";
    this.configDay.visible = false;
    this.configWeek.visible = false;
    this.monthConfig.visible = true;
  }

  configDay: DayPilot.CalendarConfig = {
    durationBarVisible: true,
    theme: 'calendar_green',
    headerDateFormat: "dddd d/M/yy",
    eventArrangement: "Full",
    cellDuration: 60,
    cellHeight: 50,
    visible: false,
    // contextMenu: this.contextMenu,
    // onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    // onBeforeEventRender: this.onBeforeEventRender.bind(this),
    // onEventClick: this.onEventClick.bind(this),
  };

  configWeek: DayPilot.CalendarConfig = {
    viewType: "Week",
    headerDateFormat: "ddd d/M/yy",
    durationBarVisible: true,
    theme: 'calendar_green',
    eventArrangement: "Full",
    cellDuration: 60,
    cellHeight: 50,
    visible: false,
    // contextMenu: this.contextMenu,
    // onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    // onBeforeEventRender: this.onBeforeEventRender.bind(this),
    // onEventClick: this.onEventClick.bind(this),
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
      // const selectedSocial = this.openSocialDialog(args);
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
      // this.onEventSelected(args);
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
    // onBeforeEventRender: this.onBeforeEventRender.bind(this),
  };

  constructor(private scheduleService: SchedulerService , ) {
    this.store = inject(ProvidersStore);
    this.store.loadProviders();
    
    effect(() => {
      this.monthCalender.events.concat(this.store.postEvents());
    })
  }

  ngAfterViewInit(): void {
    const from = this.monthCalender.control.visibleStart();
    const to = this.monthCalender.control.visibleEnd();
    this.scheduleService.getEvents(from, to).subscribe(result => {
      this.events.set(this.events().concat(result));
    });
    this.events.set(this.events().concat(this.store.postEvents()));
    console.log('Events: ', this.events());
  }

  onEventSelected(arg: MonthEventClickedArgs) {
      (async () => { 
          // Do something before delay
          // const startTime = Date.now();
          this.scheduleService.getPostForEdits(arg.e.id().toString()).subscribe((result) => {
              // console.log('Post Event', result);
              this.store.selectPostEvent(result[0]);
              // console.log('store.selectPostEvent: ', this.store.selectedPost());
              this.store.selectProvider(result[1]);
              // console.log('store.selectProvider: ', this.store.selectedProvider());
              this.store.clearMedia();
              this.store.addMedia(result[2]);
              // console.log('store.addMedia: ', this.store.postMedia());
              this.store.addCalendarArgs(arg.e.start().toDate());
              // console.log('store.addCalendarArgs: ', this.store.calenderArgs());
          });

          //! Add delay spinner
          await this.delay(500);

          // Do something after
          // const endTime = Date.now();
          // const responseTime = endTime - startTime;
          // console.log(`after delay : ${responseTime}ms later`);
          this.openYoutubeDialog('xl');
      })();
      
      
      return;
  }


  readonly dialog = inject(MatDialog);
  social = signal<Provider | undefined>(undefined);

  async openSocialDialog(args: MonthTimeRangeSelectedArgs) {
    console.log('calendarArgs', `${args.start.getDay()} / ${args.start.getMonth()} / ${args.start.getYear()}`);
    const dialogRef = this.dialog.open(SelectConnectionDialogComponent, {
      data: {
        social: this.social(),
        title: 'Select'
      },
    });

    await dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.social.set(result.social);
        console.log(`Dialog result: ${result.selectedProvider}`);
        this.store.addCalendarArgs(args.start.toDate());
        this.store.selectProvider(result.selectedProvider);

        this.openYoutubeDialog('l');
      }
    });
  }

  openYoutubeDialog(size: string) {
    const modalRef = this.modalService.open(YoutubePostComponent, { 
      centered: false,
      size: size,
      modalDialogClass: 'dark-modal',
      keyboard: false,
      backdrop: 'static',

    });
    modalRef.closed.subscribe( val => {
      console.log(val)
    });
  }

  snackbar(type:string, message: string) {
    this.snackbarService.openSnackbar(type, message);
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

}




// onBeforeEventRender(args: any) {
//   const dp = args.control;
//   args.data.areas = [
//     {
//       top: 3,
//       right: 3,
//       width: 20,
//       height: 20,
//       symbol: "/public/daypilot.svg#minichevron-down-2",
//       fontColor: "#fff",
//       toolTip: "Show context menu",
//       action: "ContextMenu",
//     },
//     {
//       top: 3,
//       right: 25,
//       width: 20,
//       height: 20,
//       symbol: "/public/daypilot.svg#x-circle",
//       fontColor: "#fff",
//       action: "None",
//       toolTip: "Delete event",
//       onClick: async (args: any)   => {
//         dp.events.remove(args.source);
//       }
//     }
//   ];

//   args.data.areas.push({
//     bottom: 5,
//     left: 5,
//     width: 36,
//     height: 36,
//     action: "None",
//     image: `https://picsum.photos/36/36?random=${args.data.id}`,
//     style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
//   });
// }


