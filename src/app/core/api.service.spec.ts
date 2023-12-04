import { TestBed } from '@angular/core/testing';

import { ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';
import { ApiService } from './api.service';
import { OkResponse } from '../shared/testing/http';

import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
jest.mock("axios");

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  test('can mock axios', async () => {
    const mockResp = {data: {body: 'foo'}}
    axios.get = jest.fn().mockResolvedValue(mockResp)
    const axiosResp = await axios.get('http://this.is.not.a.real.url')
    expect(axiosResp).toEqual(mockResp)
  });

  test('can test expected calls on axios mock via service.get', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    // axiosResponse will be passed to ApiSuccessResponse
    const axiosResponse = {status: 200, data: 'OK'};
    const mockRequest = axios.request = jest.fn().mockResolvedValue(axiosResponse);
    const svcResp = await service.get(fakeUrl);
    expect(svcResp).toEqual(new OkResponse('OK'));
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[{
      url: fakeUrl,
      method: 'get',
    }]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

  it('ApiService adds custom headers to AxiosRequestConfig, receives non-default data in response', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    // axiosResponse will be passed to ApiSuccessResponse
    const axiosResponse = {status: 200, data: 'foo'};
    const mockRequest = axios.request = jest.fn().mockResolvedValue(axiosResponse);
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    const apiResp = await service.get(fakeUrl, axiosConfig);
    expect(apiResp).toEqual(new OkResponse('foo'));
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[{
      url: fakeUrl,
      method: 'get',
      headers: extraHeaders,
    }]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

  it('can use axios mock to verify POST request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const postData = {foo: 'Foo', bar: 'Bar', baz: 'Baz'};
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    const mockRequest = axios.request = jest.fn().mockResolvedValue('ok');
    const apiResp = await service.post(fakeUrl, postData, axiosConfig);
    // service.post() will update axiosConfig & pass as single param to axios.request()
    // axiosConfig object and config found in mockRequest.mock.calls are same instance
    const expectCalls = [[{
      url: fakeUrl,
      method: 'post',
      data: postData,
      headers: extraHeaders,
    }]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

  // Test exception handling
  //
  //    AxiosError constructor(
  //        message?: string,
  //        code?: string,
  //        config?: InternalAxiosRequestConfig<D>,
  //        request?: any,
  //        response?: AxiosResponse<T, D>
  //    );
  //
  //    export interface AxiosResponse<T = any, D = any> {
  //      data: T;
  //      status: number;
  //      statusText: string;
  //      headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
  //      config: InternalAxiosRequestConfig<D>;
  //      request?: any;
  //    }

  test('catch AxiosError with non-5xx code (400 Bad Request)', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const axiosConfig = {url: fakeUrl, method: 'get', headers: new AxiosHeaders()};
    const axiosResponse = {
      status: 400,
      statusText: 'Bad Request',
      data: '',
      headers: new AxiosHeaders(),
      config: axiosConfig,
    };
    const mockRequest = axios.request = jest.fn().mockImplementation(() => {
      throw new AxiosError('Error', AxiosError.ERR_BAD_REQUEST, axiosConfig, {}, axiosResponse);
    });
    const mockConsoleLog = console.log = jest.fn();
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      success: false,
      status: 400,
      errorMessage: 'Bad Request',
      data: '',
    });
    // objectContaining() allows ignoring axiosResponse property
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
    // verify expected error was logged
    const errObject = JSON.parse(mockConsoleLog.mock.calls[0][0]["error"]);
    expect(errObject["name"]).toEqual("AxiosError");
    expect(errObject["code"]).toEqual("ERR_BAD_REQUEST");
    mockRequest.mockRestore();
    mockConsoleLog.mockRestore();
  });

  test('catch AxiosError with 500 server response (eg Internal Server Error)', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const axiosConfig = {url: fakeUrl, method: 'get', headers: new AxiosHeaders()};
    const axiosResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      data: '',
      headers: new AxiosHeaders(),
      config: axiosConfig,
    };
    const mockRequest = axios.request = jest.fn().mockImplementation(() => {
      throw new AxiosError('Error', AxiosError.ERR_BAD_RESPONSE, axiosConfig, {}, axiosResponse);
    });
    const mockConsoleLog = console.log = jest.fn();
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      success: false,
      status: 500,
      errorMessage: 'Internal Server Error',
      data: '',
    });
    // objectContaining() allows ignoring axiosResponse property
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
    // verify expected error was logged
    const errObject = JSON.parse(mockConsoleLog.mock.calls[0][0]["error"]);
    expect(errObject["name"]).toEqual("AxiosError");
    expect(errObject["code"]).toEqual("ERR_BAD_RESPONSE");
    mockRequest.mockRestore();
    mockConsoleLog.mockRestore();
  });

  test('catch AxiosError with no server response (eg Network Error)', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const mockRequest = axios.request = jest.fn().mockImplementation(() => {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK);
    });
    const mockConsoleLog = console.log = jest.fn();
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      success: false,
      status: 500,
      errorMessage: 'Network Error',
      data: '',
    });
    // objectContaining() allows ignoring axiosResponse property
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
    // verify expected error was logged
    const errObject = JSON.parse(mockConsoleLog.mock.calls[0][0]["error"]);
    expect(errObject["name"]).toEqual("AxiosError");
    expect(errObject["code"]).toEqual("ERR_NETWORK");
    mockRequest.mockRestore();
    mockConsoleLog.mockRestore();
  });

  test('catching a non-AxiosError returns ApiErrorResponse', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    //const mockRequest = axios.request = jest.fn().mockRejectedValue(new Error('Unknown Error'));
    const mockRequest = axios.request = jest.fn().mockImplementation(() => {
      throw new Error('Unknown Error')
    });
    //const mockConsoleLog = console.log = jest.fn();
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      success: false,
      status: 500,
      errorMessage: 'Unknown Error',
      data: '',
    });
    // objectContaining() allows ignoring axiosResponse property
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
    mockRequest.mockRestore();
  });
});
