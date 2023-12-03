import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  async get(url: string, config?: any) {
    const response = await axios.get(url, config).catch(error => error.response)
    return response
  }

  async post(url: any, data: any, config?: any) {
    const response = await axios.post(url, data, config).catch(error => error.reponse)
    return response
  }
}
