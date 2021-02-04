import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) { }

  ngOnInit() {
  }

  // dummy function to test database configuration
  createUser() {
    this.authenticationService.user$.subscribe((user) => {
      this.databaseService.createUser(user.uid, 10, 10);
    });
  }

  // dummy function to test database configuration
  logUser() {
    this.authenticationService.user$.subscribe((user) => {
      this.databaseService.isUser(user.uid);
    });
  }
}
