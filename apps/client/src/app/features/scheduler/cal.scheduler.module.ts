import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { provideHttpClient } from '@angular/common/http';
import { SchedulerService } from '../../services/scheduler.service';
import {DayPilotModule} from "@daypilot/daypilot-lite-angular";
import { FormsModule } from '@angular/forms';
import { SchedulerComponent } from './scheduler.component';


@NgModule({
  declarations: [
    // SchedulerComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DayPilotModule,
    FormsModule
  ],
  providers: [
    SchedulerService,
    provideHttpClient()
  ],
  exports: [SchedulerComponent]
})
export class CalSchedulerModule { }
