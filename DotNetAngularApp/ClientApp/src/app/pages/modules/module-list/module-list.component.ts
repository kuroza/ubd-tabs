import { SaveOffering } from './../../../models/offering';
import { SemesterService } from './../../../services/semester.service';
import { OfferingService } from './../../../services/offering.service';
import { MajorService } from '../../../services/major.service';
import { ModuleService } from './../../../services/module.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SaveModule } from '../../../models/module';
import { LecturerService } from '../../../services/lecturer.service';
import { ToastyService } from 'ng2-toasty';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as _ from 'underscore';
import { UserService } from '../../../services/user.service';
import { SaveSemester } from '../../../models/semester';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.scss']
})
export class ModuleListComponent implements OnInit {
  hasAccess = false;
  setActiveAddAssignModule: boolean;
  setActiveAddModule: boolean;
  setActiveSemester: boolean;
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
    private toastyService: ToastyService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private majorService: MajorService,
    private offeringService: OfferingService,
    private semesterService: SemesterService,
  ) { }

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
        textField: 'code',
        allowSearchFilter: true
      };

      this.lecturersSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
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
    this.offering.lecturers.forEach(lecturerId => {
      this.selectedLecturers.push(this.lecturers.find(lecturer => lecturer.id == lecturerId));
    });
  }

  private setModule(m) {
    this.selectedMajor = [];
    this.selectedMajor.push(this.majors.find(major => major.id == m.major.id));
    this.module.majorId = m.major.id;
    this.module.id = m.id;
    this.module.name = m.name;
    this.module.code = m.code;
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
      this.successToasty('Module was sucessfully saved');
      this.redirectTo('/pages/modules');
      // todo here, set the tab to Modules List
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

  private invalidOrBadRequestAlert() {
    this.existAlert = false;
    this.requiredAlert = true;
  }

  private conflictErrorAlert(err: any) {
    this.error = err.error;
    this.existAlert = true;
    this.requiredAlert = false;
  }

  private successToasty(message: string) {
    this.toastyService.success({
      title: 'Success',
      msg: message,
      theme: 'bootstrap',
      showClose: true,
      timeout: 3000
    });
  }

  private warningToasty(message: string) {
    this.toastyService.warning({
      title: 'Success',
      msg: message,
      theme: 'bootstrap',
      showClose: true,
      timeout: 3000
    });
  }

  submitAssignModule() {
    var result$ = (this.offering.id) ? 
      this.offeringService.update(this.offering) : this.offeringService.create(this.offering);

    result$.subscribe(() => {
      this.successToasty('Module was sucessfully assigned to semester');
      this.redirectTo('/pages/modules');
      // todo here, set the tab to Modules Offered
    },
    err => {
      if (err.status == 409) this.conflictErrorAlert(err);
      else if (err.status == 400 || err.status == 500) this.invalidOrBadRequestAlert();
    })
  }

  onClose() {
    this.existAlert = false;
    this.requiredAlert = false;
  }

  onCloseDetails() {
    this.detailsAlert = false;
  }

  editModuleOffering(id) {
    this.offeringService.getOffering(id)
    .subscribe(
      m => {
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
    this.moduleService.getModule(id)
    .subscribe(
      m => {
        this.changeToAddModuleTab();
        this.setModule(m);
      });
  }

  private changeToAddModuleTab() {
    this.setActiveSemester = false;
    this.setActiveAddModule = true;
    this.setActiveAddAssignModule = false;
  }

  deleteModuleOffering(id) {
    if (confirm("Are you sure?")) {
      this.offeringService.delete(id)
        .subscribe(() => {
          this.warningToasty('Module was sucessfully removed from semester');
          this.redirectTo('/pages/modules');
        });
    }
  }

  deleteModule(id) {
    if (confirm("Are you sure?")) {
      this.moduleService.delete(id)
        .subscribe(() => {
          this.warningToasty('Module was sucessfully deleted');
          this.redirectTo('/pages/modules');
        });
    }
  }

  selectOffering(id) {
    this.offeringService.getOffering(id)
    .subscribe(m => this.displayOfferingDetails(m),
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

  onClickBack() {
    this.module.id = 0;
    this.module.name = '';
    this.module.code = '';
    this.module.majorId = 0;
  }

  onClickBackAssign() {
    this.offering.id = 0;
    this.offering.semesterId = 0;
    this.offering.moduleId = 0;
    this.offering.lecturers = [];
  }

  onClickClose() {
    this.moduleOfferingDetails = null;
    this.moduleDetails = null;
  }

  redirectTo(uri:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }
}
