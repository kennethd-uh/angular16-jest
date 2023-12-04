// https://github.com/axios/axios/blob/b3be36585884ba1e237fdd0eacf55f678aefc396/index.d.ts#L390C37-L390C37
import axios, { AxiosResponse } from 'axios';

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

export class ApiSuccessResponse implements ApiResponse {
    statusCode: number;
    errorMessage: string;
    body: any;
    success: boolean;

    constructor(axiosResponse: AxiosResponse) {
        this.statusCode = axiosResponse.status;
        // errorMessage may be updated by Services to provide more context to
        // Component/front end/user, if 200 recvd but bad password, for example
        this.errorMessage = '';
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
        this.body = errorResponse.data;
        this.success = false;
        //this.axiosResponse = errorResponse.errorContext;
    }
}
