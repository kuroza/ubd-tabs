import { SaveOffering } from './../../../models/offering';
import { SemesterService } from './../../../services/semester.service';
import { OfferingService } from './../../../services/offering.service';
import { MajorService } from '../../../services/major.service';
import { ModuleService } from './../../../services/module.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { SaveModule } from '../../../models/module';
import { LecturerService } from '../../../services/lecturer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as _ from 'underscore';
import { UserService } from '../../../services/user.service';
import { SaveSemester } from '../../../models/semester';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { Toasty } from './../../toasty';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.scss']
})
export class ModuleListComponent implements OnInit {
  private dialogRef: NbDialogRef<any>;
  dialogHeaderTitle: string;
  offeringToBeDeleted: number;
  moduleToBeDeleted: number;
  semesterToBeDeleted: number;

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  hasAccess = false;
  setActiveAddAssignModule: boolean;
  setActiveAddModule: boolean;
  setActiveSemester: boolean;
  setActiveOfferingList: boolean;
  setActiveModuleList: boolean;
  setActiveSemesterList: boolean;
  error: string;
  existAlert: boolean = false;
  requiredAlert: boolean = false;
  detailsAlert: boolean = true;

  filter: any = {};
  moduleOfferingDetails: any;
  moduleDetails: any;
  allOfferings: any;
  offerings: any = [];
  
  semesters: any;
  semesterSettings: IDropdownSettings = {};
  selectedSemester: any = [];
  
  modules: any;
  moduleSettings: IDropdownSettings = {};
  selectedModule: any = [];
  
  lecturers: any;
  lecturersSettings: IDropdownSettings = {};
  selectedLecturers: any = [];

  majors: any;
  majorSettings: IDropdownSettings = {};
  selectedMajor: any = [];

  ngModelDate = new Date();
  
  module: SaveModule = {
    id: 0,
    name: '',
    code: '',
    majorId: 0
  };

  offering: SaveOffering = {
    id: 0,
    semesterId: 0,
    moduleId: 0,
    lecturers: []
  };

  semester: SaveSemester = {
    id: 0,
    session: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private moduleService: ModuleService,
    private lecturerService: LecturerService,
    private toastyService: Toasty,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private majorService: MajorService,
    private offeringService: OfferingService,
    private semesterService: SemesterService,
    private calendar: NgbCalendar,
    private dialogService: NbDialogService
  ) {
    this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
    if (localStorage.getItem('token') != null)
      this.hasAccess = this.userService.hasAccess();

    var sources = [
      this.semesterService.getAllSemesters(),
      this.offeringService.getAllOfferings(),
      this.majorService.getAllMajors(),
      this.lecturerService.getAllLecturers(),
      this.moduleService.getAllModules()
    ]

    Observable.forkJoin(sources)
      .subscribe(data => {
        this.semesters = data[0];
        this.allOfferings = data[1];
        this.majors = data[2];
        this.lecturers = data[3];
        this.modules = data[4];
      }, err => console.log(err));

      this.semesterSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'session',
        allowSearchFilter: true
      };

      this.moduleSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'moduleCodeAndName',
        allowSearchFilter: true
      };

      this.lecturersSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'lecturerNameAndTitle',
        allowSearchFilter: true,
        enableCheckAll: false
      };

      this.majorSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true
      };
  }

  onSemesterSelect(item: any) {
    this.offering.semesterId = item.id;
  }

  onSemesterDeSelect(item: any) {
    this.offering.semesterId = 0;
  }

  onModuleSelect(item: any) {
    this.offering.moduleId = item.id;
  }

  onModuleDeSelect(item: any) {
    this.offering.moduleId = 0;
  }

  onLecturerSelect(item: any) {
    this.offering.lecturers.push(item.id);
  }
  
  onLecturerDeSelect(item: any) {
    this.offering.lecturers.forEach( (lecturer, index) => {
      if (lecturer == item.id) this.offering.lecturers.splice(index, 1);
    });
  }
  
  onMajorSelect(item: any) {
    this.module.majorId = item.id;
  }

  onMajorDeSelect(item: any) {
    this.module.majorId = 0;
  }

  private setModuleOffering(mo) {
    this.offering.id = mo.id;

    this.selectedSemester = [];
    this.selectedSemester.push(this.semesters.find(semester => semester.id == mo.semesterId));
    this.offering.semesterId = mo.semesterId;
    
    this.selectedModule = [];
    this.selectedModule.push(this.modules.find(module => module.id == mo.module.id));
    this.offering.moduleId = mo.module.id;
    
    this.selectedLecturers = [];
    this.offering.lecturers = _.pluck(mo.lecturers, 'id');
    this.offering.lecturers.forEach(lecturerId => 
      this.selectedLecturers.push(this.lecturers.find(lecturer => lecturer.id == lecturerId)));
  }

  private setModule(m) {
    this.selectedMajor = [];
    this.selectedMajor.push(this.majors.find(major => major.id == m.major.id));
    this.module.majorId = m.major.id;
    this.module.id = m.id;
    this.module.name = m.name;
    this.module.code = m.code;
  }

  private setSemester(s) {
    this.semester.id = s.id;
    this.semester.session = s.session;
    this.semester.startDate = s.startDate;
    this.semester.endDate = s.endDate;

    this.emptyOrDeselectSemesterDatepicker();

    this.fromDate.year = parseInt(s.startDate.slice(0, 4));
    this.fromDate.month = parseInt(s.startDate.slice(5, 7));
    this.fromDate.day = parseInt(s.startDate.slice(8, 10));
    this.toDate.year = parseInt(s.endDate.slice(0, 4));
    this.toDate.month = parseInt(s.endDate.slice(5, 7));
    this.toDate.day = parseInt(s.endDate.slice(8, 10));
  }

  private emptyOrDeselectSemesterDatepicker() {
    this.fromDate.year = 0;
    this.fromDate.month = 0;
    this.fromDate.day = 0;
    this.toDate.year = 0;
    this.toDate.month = 0;
    this.toDate.day = 0;
  }

  private resetSemesterForm() {
    this.emptyOrDeselectSemesterDatepicker();
    this.semester.id = 0;
    this.semester.session = '';
    this.semester.startDate = '';
    this.semester.endDate = '';
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      this.semester.endDate = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.semester.startDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  onSemesterFilter() {
    this.filterOfferingsBySemesterId();
    this.selectedSemester = this.semesters.find(s => s.id == this.filter.semesterId);
  }

  private filterOfferingsBySemesterId() {
    this.offerings = this.allOfferings.filter(o => o.semesterId == this.filter.semesterId);
  }

  submitModule() {
    var result$ = (this.module.id) ? this.moduleService.update(this.module) : this.moduleService.create(this.module);

    result$.subscribe(() => {
      this.moduleService.getAllModules()
        .subscribe(modules => {
          this.changeToModuleListTab();
          this.modules = modules;
          this.toastyService.successToasty('Module was successfully saved');
          this.resetModuleForm();
        });
    },
    err => {
      if (err.status == 409) {
        this.conflictErrorAlert(err);
      }
      else if (err.status == 400 || 500) {
        this.invalidOrBadRequestAlert();
      }
    });
  }

  private resetModuleForm() {
    this.selectedMajor = [];
    this.module.code = '';
    this.module.name = '';
  }

  private invalidOrBadRequestAlert() {
    this.existAlert = false;
    this.requiredAlert = true;
  }

  private conflictErrorAlert(err: any) {
    this.error = err.error;
    this.existAlert = true;
    this.requiredAlert = false;
  }

  submitAssignModule() {
    var result$ = (this.offering.id) ? 
      this.offeringService.update(this.offering) : this.offeringService.create(this.offering);

    result$.subscribe(() => {
      this.offeringService.getAllOfferings()
        .subscribe(offerings => {
          this.allOfferings = offerings;
          this.toastyService.successToasty('Module was successfully assigned to semester');
          this.changeToOfferingListTab();
          this.resetOfferingForm();
        });
    },
    err => {
      if (err.status == 409) this.conflictErrorAlert(err);
      else if (err.status == 400 || err.status == 500) this.invalidOrBadRequestAlert();
    });
  }

  private resetOfferingForm() {
    this.selectedSemester = [];
    this.selectedModule = [];
    this.selectedLecturers = [];
    this.filter.semesterId = 0;
  }

  submitSemester() {
    var result$ = (this.semester.id) ? this.semesterService.update(this.semester) : this.semesterService.create(this.semester);

    result$.subscribe(() => {
      this.semesterService.getAllSemesters()
        .subscribe(semesters => {
          this.semesters = semesters;
          this.toastyService.successToasty('Semester was successfully saved');
          this.changeToSemesterListTab();
          this.resetSemesterForm();
        });
    },
    err => {
      if (err.status == 409) {
        this.conflictErrorAlert(err);
      }
      else if (err.status == 400 || 500) {
        this.invalidOrBadRequestAlert();
      }
    });
  }

  editSemester(id: number) {
    this.semesterService.getSemester(id)
    .subscribe(s => {
      this.changeToSemesterTab();
      this.setSemester(s);
    })
  }

  private changeToSemesterTab() {
    this.setActiveSemester = true;
    this.setActiveAddModule = false;
    this.setActiveAddAssignModule = false;
  }

  deleteModuleOffering(id: number, dialog: TemplateRef<any>) {
    this.offeringToBeDeleted = id;
    this.dialogHeaderTitle = "Deleting module offering"
    this.dialogRef = this.dialogService.open(dialog, { context: 'Are you sure you want remove this module from semester?' });
  }

  deleteModule(id: number, dialog: TemplateRef<any>) {
    this.moduleToBeDeleted = id;
    this.dialogHeaderTitle = "Deleting module"
    this.dialogRef = this.dialogService.open(dialog, { context: 'Are you sure you want delete module?' });
  }

  deleteSemester(id: number, dialog: TemplateRef<any>) {
    this.semesterToBeDeleted = id;
    this.dialogHeaderTitle = "Deleting semester"
    this.dialogRef = this.dialogService.open(dialog, { context: 'Are you sure you want delete semester?' });
  }

  onConfirmDelete() {
    if (this.offeringToBeDeleted) {
      this.offeringService.delete(this.offeringToBeDeleted).subscribe(() => {
        this.offeringService.getAllOfferings()
          .subscribe(offerings => {
            this.allOfferings = offerings;
            this.toastyService.defaultToasty('Module was successfully removed from semester');
            this.closeDialog();
            this.offeringToBeDeleted = 0;
            this.changeToOfferingListTab();
            this.filter.semesterId = 0;
          });
      });
    }

    if (this.moduleToBeDeleted) {
      this.moduleService.delete(this.moduleToBeDeleted).subscribe(() => {
        this.moduleService.getAllModules()
          .subscribe(modules => {
            this.modules = modules;
            this.toastyService.defaultToasty('Module was successfully deleted');
            this.closeDialog();
            this.moduleToBeDeleted = 0;
            this.changeToModuleListTab();
          });
      });
    }

    if (this.semesterToBeDeleted) {
      this.semesterService.delete(this.semesterToBeDeleted).subscribe(() => {
        this.semesterService.getAllSemesters().subscribe(semesters => {
          this.semesters = semesters;
          this.toastyService.defaultToasty('Semester was successfully deleted');
          this.closeDialog();
          this.semesterToBeDeleted = 0;
          this.changeToSemesterListTab();
        });
      });
    }
  }

  closeDialog(): void {
    if (this.dialogRef) this.dialogRef.close();
  }

  onCloseAlert() {
    this.existAlert = false;
    this.requiredAlert = false;
  }

  onCloseDetails() {
    this.detailsAlert = false;
  }

  editModuleOffering(id) {
    this.offeringService.getOffering(id).subscribe(m => {
      this.changeToAssignModuleTab();
      this.setModuleOffering(m);
    });
  }

  private changeToAssignModuleTab() {
    this.setActiveSemester = false;
    this.setActiveAddModule = false;
    this.setActiveAddAssignModule = true;
  }

  editModule(id) {
    this.moduleService.getModule(id).subscribe(m => {
      this.changeToAddModuleTab();
      this.setModule(m);
    });
  }

  private changeToAddModuleTab() {
    this.setActiveSemester = false;
    this.setActiveAddModule = true;
    this.setActiveAddAssignModule = false;
  }

  private changeToOfferingListTab() {
    this.setActiveOfferingList = true;
    this.setActiveModuleList = false;
    this.setActiveSemesterList = false;
  }

  private changeToModuleListTab() {
    this.setActiveOfferingList = false;
    this.setActiveModuleList = true;
    this.setActiveSemesterList = false;
  }

  private changeToSemesterListTab() {
    this.setActiveOfferingList = false;
    this.setActiveModuleList = false;
    this.setActiveSemesterList = true;
  }

  selectOffering(id) {
    this.offeringService.getOffering(id).subscribe(m => 
      this.displayOfferingDetails(m),
      err => {
        if (err.status == 404) {
          this.redirectTo('/pages/modules');
          return; 
        }
      });
  }

  private displayOfferingDetails(m: Object) {
    this.moduleDetails = null;
    this.moduleOfferingDetails = m;
  }

  selectModule(id) {
    this.moduleService.getModule(id)
      .subscribe(
        m => this.displayModuleDetails(m),
        err => {
          if (err.status == 404) {
            this.redirectTo('/pages/modules');
            return; 
          }
        });
  }

  private displayModuleDetails(m: Object) {
    this.detailsAlert = false;
    this.moduleOfferingDetails = null;
    this.moduleDetails = m;
  }

  onClickBackModule() {
    this.module.id = 0;
    this.module.name = '';
    this.module.code = '';
    this.module.majorId = 0;
    this.selectedMajor = [];
  }

  onClickBackOffering() {
    this.offering.id = 0;
    this.offering.semesterId = 0;
    this.selectedSemester = [];
    this.offering.moduleId = 0;
    this.selectedModule = [];
    this.offering.lecturers = [];
    this.selectedLecturers = [];
  }

  onClickBackSemester() {
    this.semester.id = 0;
    this.semester.session = '';
    this.semester.startDate = '';
    this.semester.endDate = '';
    this.emptyOrDeselectSemesterDatepicker();
  }

  onClickClose() {
    this.moduleOfferingDetails = null;
    this.moduleDetails = null;
  }

  redirectTo(uri:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }

  scrollToDetailsCard(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }
}
