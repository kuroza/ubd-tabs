import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NgCalendarComponent } from './ng-calendar.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarHeaderModule } from '../calendar-header/calendar-header.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
      CommonModule,
      NgbModalModule,
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      }),
      CalendarHeaderModule,
    ],
  declarations: [NgCalendarComponent],
  exports: [NgCalendarComponent],
  bootstrap: [NgCalendarComponent],
  providers: [],
})
export class NgCalendarModule {}