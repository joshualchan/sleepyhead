import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
  }

  async login() {
    // lock and show spinner while loading
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.authenticationService.login()) {
      await loading.dismiss();
      // only here to test database configuration
      // this.router.navigateByUrl('/tabs', { replaceUrl: true});
      this.router.navigateByUrl('/setup', { replaceUrl: true});
    } else {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Login failed',
        message: 'Please notify the developers.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

}
