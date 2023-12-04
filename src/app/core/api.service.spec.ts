import { TestBed } from '@angular/core/testing';

import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../shared/interfaces/api-response';
import { ApiService } from './api.service';
import { OkResponse } from '../shared/testing/http';

import axios, { AxiosRequestConfig } from 'axios';
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
    //console.log('mockRequest:', mockRequest);
    const svcResp = await service.get(fakeUrl);
    expect(svcResp).toEqual(new OkResponse('OK'));
    const axiosConfig: AxiosRequestConfig = {
      url: fakeUrl,
      method: 'get',
    }
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[axiosConfig]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

  it('ApiService adds custom headers to AxiosRequestConfig, receives non-default data in response', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    // axiosResponse will be passed to ApiSuccessResponse
    const axiosResponse = {status: 200, data: 'foo'};
    const mockRequest = axios.request = jest.fn().mockResolvedValue(axiosResponse);
    //console.log("mockRequest properties:", mockRequest);
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'X-Request-Origin': 'ApiServiceTest',
      }
    };
    const apiResp = await service.get(fakeUrl, axiosConfig);
    // service.get() will update axiosConfig & pass as single param to axios.request()
    axiosConfig['url'] = fakeUrl;
    axiosConfig['method'] = 'get';
    expect(apiResp).toEqual(new OkResponse('foo'));
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[axiosConfig]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

  it('can use axios mock to verify POST request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const postData = {foo: 'Foo', bar: 'Bar', baz: 'Baz'};
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'X-Request-Origin': 'ApiServiceTest',
      }
    };
    const mockRequest = axios.request = jest.fn().mockResolvedValue('ok');
    const apiResp = await service.post(fakeUrl, postData, axiosConfig);
    // service.post() will update axiosConfig & pass as single param to axios.request()
    axiosConfig['url'] = fakeUrl;
    axiosConfig['method'] = 'post';
    // calls is list of lists; our single call is a list of a single item
    const expectCalls = [[axiosConfig]];
    expect(mockRequest.mock.calls).toEqual(expectCalls);
    mockRequest.mockRestore();
  });

});
