import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, compassOutline, flagOutline, homeOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, RouterLink],
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, compassOutline, addCircleOutline, flagOutline, personCircleOutline });
  }
}
