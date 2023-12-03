import { ApiResponse, ApiErrorResponse } from '../interfaces/api-response';

// OkResponse stands in for ApiSuccessResponse, but without an AxiosResponse
export class OkResponse implements ApiResponse {
    statusCode: number;
    errorMessage: string;
    success: boolean;
    body: any;

    constructor(data: any = 'OK') {
        this.statusCode = 200;
        this.errorMessage = '';
        this.success = true;
        this.body = data;
    }
}
export const okResponse = new OkResponse();

export const unauthenticatedResponse = new ApiErrorResponse({
    status: 401,
    errorMessage: 'No login token',
});

export const unauthorizedResponse = new ApiErrorResponse({
    status: 403,
    errorMessage: 'Not permitted for resource',
});
