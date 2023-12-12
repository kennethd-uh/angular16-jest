// https://github.com/axios/axios/blob/b3be36585884ba1e237fdd0eacf55f678aefc396/index.d.ts#L390C37-L390C37
import axios, { AxiosResponse } from 'axios';

// ApiResponse is implemented by both ApiSuccessResponse & ApiErrorResponse;
// ApiSuccessResponse is instantiated with an AxiosResponse
// ApiErrorResponse populates the same interface from available context
export interface ApiResponse {
  statusCode: number;
  errorMessage: string;
  body: any;
  success: boolean;
  // adding optional AxiosResponse to type interface in case custom
  // implementors find it useful, particularly while in development, but not
  // setting in default ApiResponse implementation
  axiosResponse?: any;
}

// Callers of ApiService will generally be application-logic-related services.
// These intermediate services should expect ApiResponse from ApiService.
// The HTTP context of ApiService is not generally useful to propagate to the
// front-end components; service methods intended to be called by the front-end 
// should either return the successful response body, or a safe default value
// (for example "give me a list of things, or an empty list"), or where
// application logic feedback is more appropriate (Create-Update-Delete
// operations, etc), an ApplicationFeedback, which is just a semi-standardized set
// of fields that might make sense for API calls expecting useful JSON responses
export class ApplicationFeedback {
  message?: string;
  success?: boolean;

  constructor(responseJson: any) {
    if (responseJson.success !== undefined) {
      this.success = responseJson.success;
    }
    if (responseJson.message) {
      this.message = responseJson.message;
    }
  }
}

// ServerApiResponse is an interface of fields we may expect from the backend
// API server; they are inconsistently implemented in the legacy backend, but
// should be standardized going forward.  It is in any case useful to be able
// to assert that a ApiResponse.body is of this type to avoid TypeScript errors.
//
// to make such an assertion for TypeScript:
//
//    let json: ServerApiResponse;
//    try {
//      json = JSON.parse(response.body);
//      if (json['errorMessage']) { ... }
//    }
export interface ServerApiResponse {
  errorMessage?: string;
}

export class ApiSuccessResponse implements ApiResponse {
  statusCode: number;
  errorMessage: string;
  body: any;
  success: boolean;

  // export interface AxiosResponse<T = any, D = any> {
  //   data: T;
  //   status: number;
  //   statusText: string;  // DEPRECATED since HTTP2 (c. ~2015)
  //   headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
  //   config: InternalAxiosRequestConfig<D>;
  //   request?: any;
  // }
  constructor(axiosResponse: AxiosResponse) {
    this.statusCode = axiosResponse.status;
    // errorMessage may be updated by Services to provide more context to
    // Component/front end/user, if 200 recvd but bad password, for example
    this.errorMessage = "";
    this.body = axiosResponse.data;
    this.success = this.checkStatusCode(axiosResponse.status);
  }

  checkStatusCode(status: number) {
    if (String(status).startsWith('2')) {
      return true;
    }
    return false;
  }
}

export class ApiErrorResponse implements ApiResponse {
  statusCode: number;
  errorMessage: string;
  body: any;
  success: boolean;
  axiosResponse: any;

  constructor(errorResponse: any) {
    this.statusCode = errorResponse.status;
    this.errorMessage = errorResponse.errorMessage;
    this.body = errorResponse.data || "";
    this.success = false;
    //this.axiosResponse = errorResponse.errorContext;
  }
}
