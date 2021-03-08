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
      goal: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      wakeGoal: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  private getAgeGroup(age) {
    if (age <= 5) {
      return 'preschooler';
    } else if (age <=13) {
      return 'child';
    } else if (age <= 17) {
      return 'teenager'; 
    } else if (age <= 25) {
      return 'youngAdult'
    } else if (age <= 64) {
      return 'adult'; 
    } else {
      return 'senior'; 
    }
  }

  async setUp() {
    // lock and show spinner while loading
    const loading = await this.loadingController.create();
    await loading.present();
    this.databaseService.createUser(
      this.setUpForm.get('age').value,
      this.getAgeGroup(this.setUpForm.get('age').value), 
      this.setUpForm.get('goal').value, 
      new Date(this.setUpForm.get('wakeGoal').value)
    );
    await loading.dismiss();
    this.router.navigateByUrl('/tabs', { replaceUrl: true});
  }
}
