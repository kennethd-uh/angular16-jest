import { TestBed } from '@angular/core/testing';

import { ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';
import { ApiService } from './api.service';
import { OkResponse } from '../shared/testing/http';

import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
jest.mock("axios");

describe('ApiService', () => {
  let service: ApiService;
  let mockConsoleLog: jest.Mock<Function>;
  // TODO: What type should it be??  https://jestjs.io/docs/mock-function-api#jestspiedsource
  //let mockAxiosRequest: jest.SpiedFunction<axios.request>;
  let mockAxiosRequest: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
    // mockConsoleLog will not be restored; all console.log() messages
    // initiated by tests in this module will be written to this mock.
    // It is confirmed that mocking console.log here does *not* effect other test modules.
    mockConsoleLog = console.log = jest.fn();
    mockAxiosRequest = jest.spyOn(axios, 'request').mockImplementation(async (config: AxiosRequestConfig) => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // jest.restoreMock() & restoreAllMocks() only work on mocks created with
    // jest.spyOn(); mocks created with jest.fn() or jest.mock() must be
    // manually restored
    // TODO? restore console.log
    //console.log = origConsoleLog;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  test('can mock axios', async () => {
    const mockResp = {data: {body: 'foo'}};
    axios.get = jest.fn().mockResolvedValue(mockResp)
    const axiosResp = await axios.get('http://this.is.not.a.real.url')
    expect(axiosResp).toEqual(mockResp)
  });

  test('can test expected calls on axios mock via service.get', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    // axiosResponse will be passed to ApiSuccessResponse
    const axiosResponse = {status: 200, data: 'OK'};
    mockAxiosRequest.mockResolvedValue(axiosResponse);
    const svcResp = await service.get(fakeUrl);
    expect(svcResp).toEqual(new OkResponse('OK'));
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[{
      url: fakeUrl,
      method: 'get',
    }]];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);
  });

  it('ApiService adds custom headers to AxiosRequestConfig, receives non-default data in response', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    // axiosResponse will be passed to ApiSuccessResponse
    const axiosResponse = {status: 200, data: 'foo'};
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    mockAxiosRequest.mockResolvedValue(axiosResponse);
    const apiResp = await service.get(fakeUrl, axiosConfig);
    expect(apiResp).toEqual(new OkResponse('foo'));
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[{
      url: fakeUrl,
      method: 'get',
      headers: extraHeaders,
    }]];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);
  });

  it('can use axios mock to verify POST request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const postData = {foo: 'Foo', bar: 'Bar', baz: 'Baz'};
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    mockAxiosRequest.mockResolvedValue('ok');
    const apiResp = await service.post(fakeUrl, postData, axiosConfig);
    // service.post() will update axiosConfig & pass as single param to axios.request()
    // axiosConfig object and config found in mockRequest.mock.calls are same instance
    const expectCalls = [[{
      url: fakeUrl,
      method: 'post',
      data: postData,
      headers: extraHeaders,
    }]];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);
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
    // when ApiService.request() catches this error axiosResponse properties
    // will be used to instantiate ApiErrorResponse
    mockAxiosRequest.mockImplementation(() => {
      throw new AxiosError('Error', AxiosError.ERR_BAD_REQUEST, axiosConfig, {}, axiosResponse);
    });
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      status: 400,
      errorMessage: 'Bad Request',
    });
    // objectContaining() allows ignoring axiosResponse property
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
    // verify expected error was logged
    const errObject = JSON.parse(mockConsoleLog.mock.calls[0][0]["error"]);
    expect(errObject["name"]).toEqual("AxiosError");
    expect(errObject["code"]).toEqual("ERR_BAD_REQUEST");
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
    mockAxiosRequest.mockImplementation(() => {
      throw new AxiosError('Error', AxiosError.ERR_BAD_RESPONSE, axiosConfig, {}, axiosResponse);
    });
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
  });

  test('catch AxiosError with no server response (eg Network Error)', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    mockAxiosRequest.mockImplementation(() => {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK);
    });
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
  });

  test('catching a non-AxiosError returns ApiErrorResponse', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    mockAxiosRequest.mockImplementation(() => {
      throw new Error('Unknown Error')
    });
    const svcResp = await service.get(fakeUrl);
    const expectResponse = new ApiErrorResponse({
      success: false,
      status: 500,
      errorMessage: 'Unknown Error',
      data: '',
    });
    expect(svcResp).toEqual(expect.objectContaining(expectResponse));
  });
});
