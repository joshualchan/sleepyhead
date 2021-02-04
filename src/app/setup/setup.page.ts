import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {
  private setUpForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) { 
    this.setUpForm = formBuilder.group({
      age: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]],
      goal: ['', [Validators.required, Validators.min(0), Validators.max(23)]]
    });
  }

  ngOnInit() {
  }

  async setUp() {
    // lock and show spinner while loading
    const loading = await this.loadingController.create();
    await loading.present();

    this.authenticationService.user$.subscribe(async (user) => {
      this.databaseService.createUser(user.uid, this.setUpForm.get('age').value, this.setUpForm.get('goal').value);
      await loading.dismiss();
      this.router.navigateByUrl('/tabs', { replaceUrl: true});
    });
  }
}
