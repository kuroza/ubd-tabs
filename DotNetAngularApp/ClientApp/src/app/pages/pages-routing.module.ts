import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { BookingListComponent } from './bookings/booking-list/booking-list';
import { ViewBookingComponent } from './bookings/view-booking/view-booking';
import { NewBookingComponent } from './bookings/new-booking/new-booking.component';
import { RoomListComponent } from './rooms/room-list/room-list.component';
import { NewRoomComponent } from './rooms/new-room/new-room.component';
import { ViewRoomComponent } from './rooms/view-room/view-room';
import { UserProfileComponent } from './users/user-profile/user-profile';
import { NewFacultyComponent } from './faculties/new-faculty/new-faculty.component';
import { ViewModuleComponent } from './modules/view-module/view-module.component';
import { ModuleListComponent } from './modules/module-list/module-list.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { IndexComponent } from './top-secret/index/index.component';
import { AuthGuard } from '../services/auth.guard';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'bookings/new', component: NewBookingComponent },
    { path: 'bookings/:id', component: ViewBookingComponent },
    { path: 'bookings/edit/:id', component: NewBookingComponent },
    { path: 'bookings', component: BookingListComponent },
    { path: 'rooms/new', component: NewRoomComponent },
    { path: 'rooms/:id', component: ViewRoomComponent },
    { path: 'rooms/edit/:id', component: NewRoomComponent },
    { path: 'rooms', component: RoomListComponent },
    { path: 'account/profile', component: UserProfileComponent },  // ? change to auth/profile?
    { path: 'faculties/new', component: NewFacultyComponent },
    { path: 'modules/:id', component: ViewModuleComponent },
    { path: 'modules', component: ModuleListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'topsecret', component: IndexComponent, canActivate: [AuthGuard] },
    { path: 'auth-callback', component: AuthCallbackComponent  },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
