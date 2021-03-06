import { Toasty } from './../toasty';
import { OfferingService } from './../../services/offering.service';
import { LecturerService } from './../../services/lecturer.service';
import { FacultyService } from './../../services/faculty.service';
import { Component, TemplateRef } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BuildingService } from '../../services/building.service';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
import { Observable, Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';
import { colors } from '../../@theme/components/calendar-header/colors';
import { UserService } from '../../services/user.service';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [{
    provide: CalendarEventTitleFormatter,
    useClass: CustomEventTitleFormatter,
  }, ],
})
export class HomeComponent {
  private dialogRef: NbDialogRef<any>;
  dialogHeaderTitle: string;

  hasAccess = true;
  detailsAlert: boolean = true;
  successAlert: boolean = false;
  nbSpinner: boolean = false;

  faculties: any;
  majors: any;
  modules: any;
  semesters: any;
  buildings: any;
  lecturers: any;
  rooms: any = [];
  filter: any = {};
  allOfferings: any;
  allBookings: any;
  bookings: any; // events to be populated on calendar
  booking: any; // a single booking event

  excludeDays: number[] = [0, 5];
  weekStartsOn = DAYS_OF_WEEK.MONDAY;
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  date: string;
  refresh: Subject < any > = new Subject();
  events: CalendarEvent[] = [];
  startDateTime: any;
  endDateTime: any;
  startTime: any;
  endTime: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toasty: Toasty,
    private bookingService: BookingService,
    private buildingService: BuildingService,
    private userService: UserService,
    private facultyService: FacultyService,
    private lecturerService: LecturerService,
    private offeringService: OfferingService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('token') != null)
      this.hasAccess = this.userService.hasAccess();

    Observable.forkJoin([
      this.facultyService.getAllFaculties(),
      this.buildingService.getAllBuildings(),
      this.lecturerService.getAllLecturers(),
      this.offeringService.getAllOfferings(),
      this.bookingService.getAllBookings()
    ]).subscribe(data => {
      this.faculties = data[0];
      this.buildings = data[1];
      this.lecturers = data[2];
      this.allOfferings = data[3];
      this.bookings = this.allBookings = data[4];

      this.populateCalendar();
    }, error => console.log(error));
  }

  // * Filter by modules ---------------------------------------------------------------

  onFacultyChange() {
    this.populateMajorsDropdown();
    this.resetCalendar();
    delete this.filter.majorId;
    this.filterBookingsByFacultyId();
    this.populateCalendar();
  }

  private filterBookingsByFacultyId() {
    var bookings = this.allBookings;
    this.bookings = bookings.filter(b => b.offerings.find(o => o.module.major.facultyId == this.filter.facultyId));
  }

  private populateMajorsDropdown() {
    var selectedFaculty = this.faculties.find(faculty => faculty.id == this.filter.facultyId);
    this.majors = selectedFaculty ? selectedFaculty.majors : [];
  }

  onMajorChange() {
    var selectedMajor = this.majors.find(major => major.id == this.filter.majorId);
    this.modules = selectedMajor ? selectedMajor.modules : [];
    this.resetCalendar();
    delete this.filter.moduleId;

    var bookings = this.allBookings;
    this.bookings = bookings.filter(b => b.offerings.find(o => o.module.major.id == this.filter.majorId));
    this.populateCalendar();
  }

  onModuleFilterChange() {
    this.resetCalendar();
    var bookings = this.allBookings;

    if (this.filter.moduleId)
      this.bookings = bookings.filter(b => b.offerings.find(o => o.module.id == this.filter.moduleId));

    this.populateCalendar();
  }

  resetCalendar() {
    this.activeDayIsOpen = false;
    this.events = [];
    this.refresh.next();
  }

  resetModuleFilter() {
    this.filter = {};
    this.majors = [];
    this.modules = [];
    this.resetCalendar();
    this.showAllBookings();
  }

  // * Filter by rooms ---------------------------------------------------------------

  onBuildingChange() {
    var selectedBuilding = this.buildings.find(b => b.id == this.filter.buildingId);
    this.rooms = selectedBuilding ? selectedBuilding.rooms : [];
    delete this.filter.rooms;
    this.resetCalendar();
    this.filterBookingsByBuildingId();
    this.populateCalendar();
  }

  private filterBookingsByBuildingId() {
    var bookings = this.allBookings;
    this.bookings = bookings.filter(b => b.rooms.find(r => r.building.id == this.filter.buildingId));
  }

  onRoomChange() {
    this.resetCalendar();
    this.bookings = this.filterBookingsBySelectedRooms();
    this.populateCalendar();
  }

  private filterBookingsBySelectedRooms() {
    var bookings = this.allBookings;
    if (this.filter.rooms)
      bookings = bookings.filter(b => b.rooms.find(r => r.id == this.filter.rooms));
    return bookings;
  }

  resetRoomFilter() {
    this.filter = {};
    this.rooms = [];
    delete this.filter.rooms;
    this.resetCalendar();
    this.showAllBookings();
  }

  // * Filter by lecturers ---------------------------------------------------------------

  onLecturerChange() {
    this.resetCalendar();
    var offerings = this.allOfferings;

    if (this.filter.lecturerId) {
      var offeringIds = this.mapOfferingIdsFromOfferings(offerings);
      offeringIds.forEach(offeringId => {
        this.filterBookingsByOfferingId(offeringId);
        this.populateCalendar();
      });
    }
  }

  private mapOfferingIdsFromOfferings(offerings: any) {
    return offerings
      .filter(offering => offering.lecturers
        .find(l => l.id == this.filter.lecturerId))
      .map(offering => offering.id);
  }

  private filterBookingsByOfferingId(offeringId: any) {
    this.bookings = this.allBookings
      .filter(b => b.offerings
        .find(bo => bo.id == offeringId));
  }

  resetLecturerFilter() {
    this.filter = {};
    delete this.filter.lecturers;
    this.resetCalendar();
    this.showAllBookings();
  }

  showAllBookings() {
    this.bookings = this.allBookings;
    this.populateCalendar();
  }

  private populateCalendar() {
    for (let b of this.bookings) {      
      var lecturerArray: any = convertLecturerSetToArray(b, this.allOfferings);
      var lecturers: string = bookingLecturers(lecturerArray);
      var modules: string = bookingModules(b);
      var rooms: string = bookingRooms(b);
      var purpose: string = bookingPurpose(b);

      for (let bd of b.bookDates) {
        var bookDate = this.formatBookDateToDisplayOnTimetable(bd);
        for (let timeSlot of b.timeSlots) {
          this.formatTimeToDisplayOnTimetable(timeSlot, bookDate);
          this.events = [
            ...this.events, {
              start: new Date(this.startDateTime),
              end: new Date(this.endDateTime),
              title: `<b>${ modules } ${ purpose }</b><br>${ rooms }<br>${ lecturers }`,
              color: colors.teal,
              meta: { id: b.id },
            },
          ];
        }
      }
    }
    this.refresh.next();
  }

  private formatBookDateToDisplayOnTimetable(bd: any) {
    var dateFormat = require('dateformat');
    var bookDate = dateFormat(bd.date, 'yyyy-mm-dd');
    return bookDate;
  }

  private formatTimeToDisplayOnTimetable(timeSlot: any, bookDate: any) {
    var timeFormat = require('dateformat');
    this.startTime = timeFormat(timeSlot.startTime, 'HH:MM:ss');
    this.startDateTime = bookDate + "T" + this.startTime;
    this.endTime = timeFormat(timeSlot.endTime, 'HH:MM:ss');
    this.endDateTime = bookDate + "T" + this.endTime;
  }

  refreshPage() {
    window.location.reload();
  }

  dayClicked({date, events}: {date: Date; events: CalendarEvent[]}): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventClicked({event}: {event: CalendarEvent}): void {
    this.bookingService.getBooking(event.meta.id)
      .subscribe(b => this.booking = b);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  changeDay(date: Date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  deleteBooking(dialog: TemplateRef<any>) {
    this.dialogHeaderTitle = "Deleting booking"
    this.dialogRef = this.dialogService.open(dialog, { context: 'Are you sure you want delete booking?' });
  }

  onConfirmDelete() {
    this.bookingService.delete(this.booking.id)
      .subscribe(() => {
        this.toasty.defaultToasty('Booking was successfully deleted');
        this.refreshPage();
        this.closeDialog();
      });
  }

  closeDialog(): void {
    if (this.dialogRef) this.dialogRef.close();
  }

  onCloseDetailsAlert() {
    this.detailsAlert = false;
  }

  onCloseBookingDetails() {
    this.booking = null;
  }

  onCloseSuccessAlert() {
    this.successAlert = false;
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', {
      skipLocationChange: true
    }).then(() =>
      this.router.navigate([uri]));
  }

  scrollToDetailsCard(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }
}

export function convertLecturerSetToArray(b: any, allOfferings: any) {
  var moduleLecturers = new Set();
  var offering: any;
  
  const offeringIds: number[] = b.offerings.map(offering => offering.id);
  
  for (let id of offeringIds) {
    offering = allOfferings.find(o => o.id == id);
    for (let lecturer of offering.lecturers)
      moduleLecturers.add(lecturer);
  }

  var lecturersArray = Array.from(moduleLecturers);
  return lecturersArray;
}

export function bookingLecturers(lecturerArray: any) {
  var lecturers: string = `${lecturerArray[0].name} (${lecturerArray[0].title})`;
  if (lecturerArray.length > 1) {
    for (var i = 1; i < lecturerArray.length; i++)
      lecturers += `, ${lecturerArray[i].name} (${lecturerArray[i].title})`;
  }
  return lecturers;
}

export function bookingModules(b: any) {
  var modules: string = `${b.offerings[0].module.code}: ${b.offerings[0].module.name}`;
  if (b.offerings.length > 1) {
    for (var i = 1; i < b.offerings.length; i++)
      modules += `, ${b.offerings[i].module.code}: ${b.offerings[i].module.name}`;
  }
  return modules;
}

export function bookingRooms(b: any) {
  var rooms: string = `${b.rooms[0].name}`;
  if (b.rooms.length > 1) {
    for (var i = 1; i < b.rooms.length; i++)
      rooms += `, ${b.rooms[i].name}`;
  }
  return rooms;
}

export function bookingPurpose(b: any) {
  if (b.purpose != '')
    return `(${b.purpose})`;
  else
    return '';
}