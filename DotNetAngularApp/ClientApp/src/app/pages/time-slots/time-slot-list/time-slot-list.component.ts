import { ToastyService } from 'ng2-toasty';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TimeSlotService } from '../../../services/timeSlot.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ngx-view-time-slots',
  templateUrl: './time-slot-list.component.html',
})
export class TimeSlotListComponent implements OnInit {

  hasAccess = false;

  timeSlots: any;

  constructor(
    private timeSlotService: TimeSlotService,
    private userService: UserService,
    private toasty: ToastyService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      this.hasAccess = this.userService.hasAccess();
    }

    this.timeSlotService.getAllTimeSlots()
      .subscribe(timeSlots => this.timeSlots = timeSlots);
  }

  edit(id) {
    this.timeSlotService.getTimeSlot(id)
    .subscribe(
      ts => {
        // this.setActiveAddTimeSlot = true;
        // this.setTimeSlot(ts);
      });
  }

  delete(id) {
    if (confirm("Are you sure?")) {
      this.timeSlotService.delete(id)
        .subscribe(x => {
          this.toasty.success({
            title: 'Success', 
            msg: 'Time slot was sucessfully deleted.',
            theme: 'bootstrap',
            showClose: true,
            timeout: 3000
          });
          this.redirectTo('/pages/timeslots');
        });
    }
  }

  redirectTo(uri:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }
}