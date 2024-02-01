import { Injectable } from '@angular/core';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';
import { LogService } from "./log.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private logger: LogService) { }

  // mirror axios pattern of a single request() method, with HTTP verb-specific
  // helpers that only provide contextual awareness to prepare config
  async request<T>(config: AxiosRequestConfig) {
    let response: ApiResponse;

    await this.logger.debug('ApiService.request: ' + config['url']);
    try {
      const res = await axios.request<T>(config);
      response = new ApiSuccessResponse(res);
      await this.logger.debug(response);
    } catch (error) {
      // default, generic error
      let status_code = 500;
      let error_message: string = 'Request Failed';
      let body = '';

      // error may or may not be AxiosError
      // axios error interface:
      // https://github.com/axios/axios/blob/b3be36585884ba1e237fdd0eacf55f678aefc396/index.d.ts#L399
      if (error instanceof AxiosError) {
        if (error['response']) {
          // request succeeded; got response from server
          status_code = error.response.status;
          error_message = error.response.statusText;
          body = error.response.data;
        }
        else if (error['message']) {
          error_message = error['message'];
        }
        else {
          error_message = 'Generic Axios Error'
        }
      }
      else if (error instanceof Error) {
        if (error['message']) {
          error_message = error['message'];
        }
      }

      var error_context = {config: config, error: error}
      await this.logger.error(error_context);

      // ApiErrorResponse constructor accepts args corresponding to AxiosError
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
    return this.request<T>(config);
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig) {
    config = config ? config : {};
    config['url'] = url;
    config['method'] = 'post';
    config['data'] = data;
    return this.request<T>(config);
  }
}
