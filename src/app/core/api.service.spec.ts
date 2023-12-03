import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

import axios from 'axios';
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

  test('can test expected calls on axios mock', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const mockResp = {data: {body: 'foo'}};
    const mockGet = axios.get = jest.fn().mockResolvedValue(mockResp);
    //console.log('mockGet:', mockGet);
    const axiosResp = await axios.get(fakeUrl);
    expect(axiosResp).toEqual(mockResp);
    // mocking with anonymous jest.fn() records calls received without
    // awareness of API being mocked (contrast w/spyOn in next test)
    const expectCalls = [[fakeUrl]];
    expect(mockGet.mock.calls).toEqual(expectCalls);
    mockGet.mockRestore();
  });

  it('can jest.spyOn() axios to verify GET request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const mockResp = {data: {body: 'foo'}};
    const spy = jest.spyOn(axios, 'get');
    spy.mockResolvedValue(mockResp);
    const apiResp = await service.get(fakeUrl);
    //console.log("spy properties:", spy);
    expect(apiResp).toEqual(mockResp);
    // 2nd arg (undefined) is config: https://axios-http.com/docs/instance
    const expectCalls = [[fakeUrl, undefined]];
    expect(spy.mock.calls).toEqual(expectCalls);
    spy.mockRestore();
  });

  it('can jest.spyOn() axios to verify POST request to ApiService', async () => {
    const fakeUrl = 'http://this.is.not.a.real.url';
    const postData = {foo: 'Foo', bar: 'Bar', baz: 'Baz'};
    const spy = jest.spyOn(axios, 'post');
    spy.mockResolvedValue('ok');
    const apiResp = await service.post(fakeUrl, postData);
    const expectCalls = [[fakeUrl, postData, undefined]];
    expect(spy.mock.calls).toEqual(expectCalls);
    spy.mockRestore();
  });

});
