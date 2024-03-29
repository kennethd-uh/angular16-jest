import { TestBed } from '@angular/core/testing';

import { ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';
import { ApiService } from './api.service';
import { ConsoleLogHandler, Severity } from './log.service';
import {
  expectSuccessfulApiRequestLog,
  expectApiRequestErrorLog,
  expectLastLogMessageMatches
} from 'src/app/shared/testing/logging';
import { OkResponse } from '../shared/testing/http';

import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
jest.mock("axios");

describe('ApiService', () => {
  let service: ApiService;
  // TODO: What type should it be??  https://jestjs.io/docs/mock-function-api#jestspiedsource
  //let mockAxiosRequest: jest.SpiedFunction<axios.request>;
  let mockAxiosRequest: any;
  let mockConsoleLog: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
    // creating a spy on axios.request() with no-op implementation prevents tests from making HTTP requests
    mockAxiosRequest = jest.spyOn(axios, 'request')
                           .mockImplementation(async (config: AxiosRequestConfig) => {});
    // mock ConsoleLogHandler.log() to collect but not display logged messages
    mockConsoleLog = jest.spyOn(ConsoleLogHandler.prototype, 'log')
                         .mockImplementation(async(datestr: string, severity: Severity, msg: any) => {});
  });

  afterEach(() => {
    // jest.restoreMock() & restoreAllMocks() only work on mocks created with jest.spyOn();
    // mocks created with jest.fn() or jest.mock() must be manually restored.
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  test('can mock axios', async () => {
    const mockResp = {data: {body: 'foo'}};
    const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue(mockResp)
    const axiosResp = await axios.get('http://this.is.not.a.real.url')
    expect(axiosResp).toEqual(mockResp)
  });

  test('can test expected calls on axios mock via service.get', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const axiosResponse = {status: 200, data: 'OK'};
    mockAxiosRequest.mockResolvedValue(axiosResponse);
    // axiosResponse will be passed to ApiSuccessResponse's constructor
    const svcResp = await service.get(fakeUrl);
    expect(svcResp).toEqual(new OkResponse('OK'));
    // calls is list of lists; our single call is a list w/single axiosConfig item
    const expectCalls = [
      [{url: fakeUrl, method: 'get'}],
    ];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);

    expectSuccessfulApiRequestLog(mockConsoleLog, fakeUrl);
  });

  it('ApiService adds custom headers to AxiosRequestConfig, receives non-default data in response', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const axiosResponse = {status: 200, data: 'foo'};
    // verify custom headers propagate correctly
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    mockAxiosRequest.mockResolvedValue(axiosResponse);
    const apiResp = await service.get(fakeUrl, axiosConfig);
    // OkResponse() can be used for equality comparison with ApiSuccessResponse()
    expect(apiResp).toEqual(new OkResponse('foo'));
    const expectCalls = [
      [{url: fakeUrl, method: 'get', headers: extraHeaders}],
    ];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);

    expectSuccessfulApiRequestLog(mockConsoleLog, fakeUrl);
  });

  it('can use axios mock to verify POST request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const postData = {foo: 'Foo', bar: 'Bar', baz: 'Baz'};
    const extraHeaders = { 'X-Request-Origin': 'ApiServiceTest' };
    const axiosConfig: AxiosRequestConfig = { headers: extraHeaders };
    const axiosResponse = {status: 200, data: 'foo'};
    mockAxiosRequest.mockResolvedValue(axiosResponse);
    const apiResp = await service.post(fakeUrl, postData, axiosConfig);
    // service.post() will update axiosConfig & pass as single param to axios.request()
    // axiosConfig object and config found in mockRequest.mock.calls are same instance
    const expectCalls = [
      [{url: fakeUrl, method: 'post', data: postData, headers: extraHeaders}],
    ];
    expect(mockAxiosRequest.mock.calls).toEqual(expectCalls);

    expectSuccessfulApiRequestLog(mockConsoleLog, fakeUrl);
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

    const expectAxiosError = {
      code: AxiosError.ERR_BAD_REQUEST,
    }
    const expectAxiosResponse = {
      status: 400,
      statusText: 'Bad Request',
    }
    expectApiRequestErrorLog(mockConsoleLog, fakeUrl, expectAxiosError, expectAxiosResponse);
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

    const expectAxiosError = {
      code: AxiosError.ERR_BAD_RESPONSE,
    }
    const expectAxiosResponse = {
      status: 500,
      statusText: 'Internal Server Error',
    }
    expectApiRequestErrorLog(mockConsoleLog, fakeUrl, expectAxiosError, expectAxiosResponse);
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

    const expectAxiosError = {
      code: AxiosError.ERR_NETWORK,
      message: 'Network Error',
    }
    expectApiRequestErrorLog(mockConsoleLog, fakeUrl, expectAxiosError);
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

    // assert we have both a DEBUG & ERROR message; assert nothing about the error
    expectApiRequestErrorLog(mockConsoleLog, fakeUrl);
    // console.log
    //   2024-01-31T12:43:02.657Z ERROR {
    //     config: { url: 'http://this.is.not.a.real.url', method: 'get' },
    //     error: Error: Unknown Error
    //         at Function.<anonymous> (.../dist/test-out/src/app/core/api.service.spec.ts:322:13)
    //         ...
    //   }
    expectLastLogMessageMatches(mockConsoleLog, Severity.ERROR, 'Unknown Error');
  });

});
