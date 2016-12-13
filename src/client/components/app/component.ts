import { Component } from '@angular/core';

@Component({
  selector: 'app-seed',
  template: require('./template.html'),
  styleUrls: [require('./styles.css')]
})
export class AppComponent {

  title: string = 'Angular2 Seed';

  constructor() { }
}
