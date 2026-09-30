import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ClerkSignUpComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-up',
  templateUrl: 'sign-up.page.html',
  styleUrls: ['sign-up.page.scss'],
  imports: [IonContent, ClerkSignUpComponent],
})
export class SignUpPage {}
