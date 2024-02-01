import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import axios, { AxiosRequestConfig } from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

import { ApiResponse, ApplicationFeedback } from '../shared/interfaces/api-response';
import { ApiService } from './api.service';
import { LogService } from "./log.service";
import { UserDetails } from '../shared/interfaces/user-details';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  savedUser: Subject<UserDetails> = new Subject<UserDetails>()

  constructor(private apiService: ApiService, 
              private cookieService: CookieService,
              private logger: LogService) { }

  loadSavedUserCookie() {
    var tempUser: UserDetails
    var tempToken: string
    if (this.cookieService.check('savedUser') && this.cookieService.check('token')) {
      tempUser = JSON.parse(this.cookieService.get('savedUser'))
      tempToken = this.cookieService.get('token')
      if (tempUser && tempToken) {
        this.savedUser.next(tempUser)
        axios.defaults.headers.common['Authorization'] = tempToken
        return true
      }
    }
    return false
  }

  async login(username: string, password: string) {
    var user = {
      username: username,
      password: password
    }
    // TODO: log login attempt clientip, clientapp, server

    const response: ApiResponse = await this.apiService.post<UserDetails>('/api/account/authenticate', user)

    if (response.success) {
      await this.logger.info('successful login: ' + username);
      this.saveCredentials(response, user);
      return new ApplicationFeedback({success: true, message: 'Login successful'});
    }
    await this.logger.info('failed login: ' + username);
    return new ApplicationFeedback({success: false, message: 'Login failed'});
  }

  // TODO: REVIEW: is it security risk to change this to public/protected to
  // allow testing?  Possibly tests can bypass this call & check state of
  // cookieService?
  // TODO: KLD: is there any reason both response & user are passed here?
  private saveCredentials(response: any, user: any) {
    var token = btoa(user.username + ':' + user.password);
    var tempUser: UserDetails = {
      username: user.username,
      isUserLoggedIn: true,
      isSuperUser: response.body.IsSuperUser
    }
    axios.defaults.headers.common['Authorization'] = token
    this.savedUser.next(tempUser)
    this.cookieService.set(
      'token',
      token,
      {
        expires: 3,
        secure: true,
        sameSite: 'Strict'
      }
    )
    this.cookieService.set(
      'savedUser',
      JSON.stringify(tempUser),
      {
        expires: 3,
        secure: true,
        sameSite: 'Strict'
      }
    )
  }

  getCurrentUser() {
    return this.savedUser
  }

  subscribeToUser() {

  }

  removeCredentials() {
    this.savedUser.next({
      username: '',
      isUserLoggedIn: false,
      isSuperUser: false
    })
    this.cookieService.deleteAll()
    axios.defaults.headers.common['Authorization'] = ''
  }


  //service = {
  //login: login,
  //register: register,
  //saveCredentials: saveCredentials,
  //removeCredentials: removeCredentials,
  //isUserLoggedIn: isUserLoggedIn,
  //isSuperUser: isSuperUser,
  //getAllUsers: getAllUsers,
  //deleteUser: deleteUser
  //}

  //function deleteUser(id, completed) {
  //  apiService.post('api/account/user/delete/' + id, null, completed, deleteUserFailed);
  //}


  //function loginFailed(response) {
  //  notificationService.displayError(response.data);
  //}

  //function deleteUserFailed(response) {
  //  notificationService.displayError('DeleteUser failed. Try again.');
  //}

  //function isUserLoggedIn() {
  //  return $rootScope.repository.loggedUser != null;
  //}

  //function isSuperUser() {
  //  return ($rootScope.repository.loggedUser != null && $rootScope.repository.loggedUser.IsSuperUser);
  //}
}
