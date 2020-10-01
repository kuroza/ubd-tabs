import * as _ from 'underscore';
import { BookingService } from '../../../services/booking.service';
import { Component, OnInit, Injectable } from '@angular/core';
import { ToastyService } from 'ng2-toasty';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/Observable/forkJoin';
import { SaveBooking } from '../../../models/booking';
import { NgbDateStruct, NgbCalendar, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '-'; // change in input form

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
  }
}

@Component({
  selector: 'ngx-booking-form',
  styleUrls: ['./booking-form.component.scss'],
  templateUrl: './booking-form.component.html',
})
export class BookingFormComponent implements OnInit {
  readonly DELIMITER = '-';
  nbDate: any;
  day: number;
  month: number;
  year: number;
  datePicker: string;
  buildings: any;
  rooms: any;
  timeSlots: any;
  modules: any;
  booking: SaveBooking = {
    id: 0,
    roomId: 0,
    buildingId: 0,
    bookDate: '',
    timeSlots: [], // selectedTimeSlots
    modules: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private toastyService: ToastyService) {

    route.params.subscribe(p => {
      this.booking.id = +p['id'] || 0;
    });
  }

  ngOnInit() {
    var sources = [
      this.bookingService.getBuildings(),
      this.bookingService.getTimeSlots(),
      this.bookingService.getModules(),
    ];

    // for editing Booking events
    if (this.booking.id)
      sources.push(this.bookingService.getBooking(this.booking.id));

    Observable.forkJoin(sources).subscribe(data => {
      this.buildings = data[0];
      this.timeSlots = data[1];
      this.modules = data[2];

      if (this.booking.id) {
        this.setBooking(data[3]);
        this.populateRooms();
      }
    }, err => {
      if (err.status == 404)
        this.router.navigate(['/']);
    });
  }

  onClickReset() {
    this.booking.id = 0;
    this.booking.roomId = 0;
    this.booking.buildingId = 0;
    this.booking.bookDate = '';
    this.booking.timeSlots = [];
    this.booking.modules = [];
  }

  private setBooking(b) {
    this.booking.id = b.id;
    this.booking.buildingId = b.building.id;
    this.booking.roomId = b.room.id;
    this.booking.bookDate = b.bookDate;
    this.booking.timeSlots = _.pluck(b.timeSlots, 'id');
    this.booking.modules = _.pluck(b.modules, 'id');
  }

  onBuildingChange() {
    this.populateRooms();

    delete this.booking.roomId;
  }

  private populateRooms() {
    var selectedBuilding = this.buildings.find(b => b.id == this.booking.buildingId);
    this.rooms = selectedBuilding ? selectedBuilding.rooms : [];
  }

  submit() {
    // Rearrange date
    // var date = this.booking.bookDate.split(this.DELIMITER);
    // this.year = parseInt(date[2], 10);
    // this.month = parseInt(date[1], 10);
    // this.day = parseInt(date[0], 10);
    // this.booking.bookDate = this.month + this.DELIMITER + this.day + this.DELIMITER + this.year;

    // Convert JSON values into string
    var date: any = this.booking.bookDate; // date has to be of 'any' type
    this.year = date.year;
    this.month = date.month;
    this.day = date.day;
    this.booking.bookDate = this.year + this.DELIMITER + this.month + this.DELIMITER + this.day;

    var result$ = (this.booking.id) ? this.bookingService.update(this.booking) : this.bookingService.create(this.booking); 
    result$.subscribe(b => {
      this.toastyService.success({
        title: 'Success', 
        msg: 'Booking was sucessfully saved.',
        theme: 'bootstrap',
        showClose: true,
        timeout: 5000
      });
      this.router.navigate(['/pages/bookings/', this.booking.id]);
    });
  }
}