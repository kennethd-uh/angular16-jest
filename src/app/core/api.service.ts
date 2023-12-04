import { Injectable } from '@angular/core';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor() { }

  // mirror axios pattern of a single request() method, with HTTP verb-specific
  // helpers that only provide contextual awareness to prepare config
  async request<T>(config: AxiosRequestConfig) {
    let response: ApiResponse;

    try {
      const res = await axios.request<T>(config);
      response = new ApiSuccessResponse(res);
    } catch (error) {
      console.log(' >>> >>> >>> ApiService.request() caught error: ' + error);
      var error_context = {
        config: config,
        error: error,
      }
      // TODO: replace with LogService
      console.log(error_context);

      // error may or may not be AxiosError
      // axios error interface:
      // https://github.com/axios/axios/blob/b3be36585884ba1e237fdd0eacf55f678aefc396/index.d.ts#L399
      let status_code = 500;
      let error_message: string = 'Request Failed';
      let body = '';
      if (error instanceof AxiosError) {
        if (error['response']) {
          // request succeeded; got response from server
          status_code = error.response.status;
          error_message = error.response.statusText;
          body = error.response.data;
        }
        else {
          error_message = 'Generic Axios Error'
        }
      }

      response = new ApiErrorResponse({
        status: status_code,
        data: body,
        errorMessage: error_message,
        errorContext: error_context,
      });
    }
    return response;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    config = config ? config : {};
    config['url'] = url;
    config['method'] = 'get';
    return await this.request<T>(config);
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig) {
    config = config ? config : {};
    config['url'] = url;
    config['method'] = 'post';
    config['data'] = data;
    return await this.request<T>(config);
  }
}
