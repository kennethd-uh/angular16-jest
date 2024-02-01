import { TestBed, async } from "@angular/core/testing";

import axios, { AxiosRequestConfig } from 'axios';

import { AuthenticationService } from "./authentication.service";
import { ApiResponse } from '../shared/interfaces/api-response';
import { ApiService } from "./api.service";
import { ConsoleLogHandler, Severity } from './log.service';
import { OkResponse, serverErrorResponse } from '../shared/testing/http';
import { expectLastLogMessageEquals } from 'src/app/shared/testing/logging';

describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let api: ApiService;
  let mockConsoleLog: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[]
    });
    service = TestBed.inject(AuthenticationService);
    api = TestBed.inject(ApiService);
    // mock ConsoleLogHandler.log() to collect but not display logged messages
    mockConsoleLog = jest.spyOn(ConsoleLogHandler.prototype, 'log')
                         .mockImplementation(async(datestr: string, severity: Severity, msg: any) => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // mock cookieService & test various conditions to verify behavior
  test.todo("loadSavedCookie loads savedUser from cookie");

  // mock apiService & verify expected request is made to authenticate endpoint
  it("calls authenticate endpoint with expected params & returns user object on success", async () => {
    const name = "fakename";
    const pass = "pass1234";
    const user = {
      username: name,
      password: pass
    };

    const mockApiPost = jest.spyOn(api, 'post');
    const okResponse= new OkResponse({
        username: name,
        password: pass,
        IsSuperUser: 0,
    });
    mockApiPost.mockImplementation(async <ApiResponse>(url: string, data: any, config?: AxiosRequestConfig) => {
        return okResponse;
    });

    // TODO: is it possible to test while still private??
    // const mockSavedCreds = service.saveCredentials = jest.fn();

    const svcResp = await service.login(name, pass);
    const expectCalls = [['/api/account/authenticate', user, undefined]];
    expect(mockApiPost.mock.calls).toEqual(expectCalls);

    const expectBody = {success: true, message: 'Login successful'};
    expect(svcResp).toEqual(expectBody);
    // expect(mockSavedCreds).toBeCalledWith(okResponse, user);

    const expectMsg = "successful login: fakename";
    expectLastLogMessageEquals(mockConsoleLog, Severity.INFO, expectMsg);
  });

  test("login() does something appropriate when login fails", async () => {
    const name = "fakename";
    const pass = "pass1234";
    const user = {
      username: name,
      password: pass
    };

    const mockApiPost = jest.spyOn(api, 'post').mockResolvedValue(serverErrorResponse);

    const svcResp = await service.login(name, pass);
    const expectCalls = [['/api/account/authenticate', user, undefined]];
    expect(mockApiPost.mock.calls).toEqual(expectCalls);

    const expectBody = {success: false, message: 'Login failed'};
    expect(svcResp).toEqual(expectBody);

    const expectMsg = "failed login: fakename";
    expectLastLogMessageEquals(mockConsoleLog, Severity.INFO, expectMsg);
  });

  // TODO Need to figure out how to test private functions
  test.todo("saveCredentials() updates cookieService with expected values");

  test.todo("removeCredentials() deletes all cookies from cookieService");
});
