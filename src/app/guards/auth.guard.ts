import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canLoad() {
    if (this.authenticationService.isAuthenticated) {
      console.log('AuthGuard returns true');
      return true;
    } else {
      console.log('AuthGuard returns false');
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
