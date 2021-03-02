import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService} from '../services/database.service';

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
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) { }

  ngOnInit() {
  }

  async login() {
    // lock and show spinner while loading
    const loading = await this.loadingController.create();
    await loading.present();

    this.authenticationService.login().then(async (user) => {  
      this.databaseService.setUser(user.uid);
      this.databaseService.getUser().then(async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/tabs', { replaceUrl: true});
      }).catch(async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/setup', { replaceUrl: true});
      });
    }).catch(async () => {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Login failed',
        message: 'Please notify the developers.',
        buttons: ['OK'],
      });
      await alert.present();
    });
  }

}
