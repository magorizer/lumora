import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ClerkSignInComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  templateUrl: 'sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
  imports: [IonContent, ClerkSignInComponent],
})
export class SignInPage {}
