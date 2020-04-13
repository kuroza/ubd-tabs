import { AuthService } from './../../../services/auth.service';
import { BookingService } from './../../../services/booking.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-booking-list',
  templateUrl: './booking-list.html'
})
export class BookingListComponent implements OnInit {
  private readonly PAGE_SIZE = 8;

  queryResult: any = {}; // or 'bookings: Booking[];'
  buildings: any; // or 'buildings: KeyValuePair[];'
  query: any = {
    pageSize: this.PAGE_SIZE // initialize page size
  };
  columns = [ // display on table head on each column
    { title: 'Id' },
    { title: 'Building', key: 'building', isSortable: true },
    { title: 'Room', key: 'room', isSortable: true },
    { title: 'Date', key: 'bookDate', isSortable: false },
    { title: 'Name', key: 'contactName', isSortable: true },
    { }
  ];
  
  constructor( // injecting service
    private bookingService: BookingService, 
    public auth: AuthService) { }

  ngOnInit() { // when the page starts
    this.bookingService.getBuildings() // get the buildings from service for filter drop down
      .subscribe(buildings => this.buildings = buildings); // and store in this.buildings

    this.populateBookings(); // initially, get the unfiltered bookings to show in table
  }

  private populateBookings() {
    this.bookingService.getBookings(this.query) // get filtered bookings using queries
      .subscribe(result => this.queryResult = result); // saves filtered booking list to queryResult
  }

  onFilterChange() { // filtering
    this.query.page = 1; // reset, go back to page 1?
    this.populateBookings(); // no need to input parameter, just use 'this'
  }

  resetFilter() { // filtering
    this.query = {
      page: 1,
      pageSize: this.PAGE_SIZE
    };
    this.populateBookings();
  }

  sortBy(columnName) { // sorting
    if (this.query.sortBy === columnName) { // initially table is sort by Id
      this.query.isSortAscending = !this.query.isSortAscending; // toggle sort ascending and descending
    } else {
      this.query.sortBy = columnName;
      this.query.isSortAscending = true;
    }
    this.populateBookings();
  }

  onPageChange(page) { // pagination
    this.query.page = page;
    this.populateBookings();
  }
}