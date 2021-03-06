
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NbCardModule, NbTabsetModule, NbButtonModule, NbAccordionModule, NbSelectModule, NbAlertModule, NbSpinnerModule, NbRadioModule, NbIconModule, NbTooltipModule, NbListModule } from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarHeaderModule } from '../../@theme/components/calendar-header/calendar-header.module';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    NbListModule,
    NbTooltipModule,
    NgxPrintModule,
    NbIconModule,
    NbRadioModule,
    NbSpinnerModule,
    NbAlertModule,
    NbCardModule,
    ThemeModule,
    FormsModule,
    RouterModule,
    NbTabsetModule,
    NbAccordionModule,
    NbButtonModule,
    NbSelectModule,
    NgbModalModule,
    CommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CalendarHeaderModule,
  ],
  exports: [HomeComponent],
  bootstrap: [HomeComponent],
  declarations: [
    HomeComponent,
  ],
})
export class HomeModule { }
