import { ApiResponse } from 'src/app/shared/interfaces/api-response';
import { BaseLogHandler, Severity } from 'src/app/core/log.service';

export function expectSuccessfulApiRequestLog(mockLogHandler: any,
                                              url: string,
                                              body: any = undefined): void {
    // verify expected calls to LogService
    // all requests trigger DEBUG log before attempting request
    // 2024-01-31T11:51:20.580Z DEBUG ApiService.request: http://this.is.not.a.real.url
    expect(mockLogHandler.mock.calls[0][1]).toEqual(Severity.DEBUG);
    const expectMsg = "ApiService.request: " + url;
    expect(mockLogHandler.mock.calls[0][2]).toEqual(expectMsg);
    // 2024-01-31T13:04:36.408Z DEBUG ApiSuccessResponse {
    //   statusCode: 200,
    //   errorMessage: '',
    //   body: {
    //     ...
    //   },
    //   success: true
    // }
    expect(mockLogHandler.mock.calls[1][1]).toEqual(Severity.DEBUG);
    const expectApiResponse = <ApiResponse>{
      statusCode: 200,
      success: true,
    }
    if (body) {
      expectApiResponse.body = body;
    }
    expect(mockLogHandler.mock.calls[1][2]).toMatchObject(expectApiResponse);
};

export function expectApiRequestErrorLog(mockLogHandler: any,
                                         url: string,
                                         axiosError: any = undefined,
                                         axiosResponse: any = undefined,
                                         axiosConfig: any = undefined): void {
    // all requests trigger DEBUG log before attempting request
    // 2024-01-31T11:51:20.580Z DEBUG ApiService.request: /api/account/register
    expect(mockLogHandler.mock.calls[0][1]).toEqual(Severity.DEBUG);
    const expectDebugMsg = "ApiService.request: " + url;
    expect(mockLogHandler.mock.calls[0][2]).toEqual(expectDebugMsg);
    // AxiosError thrown by mock should be caught & converted to
    //   2024-01-31T20:13:00.704Z ERROR {
    //     config: {
    //       url: '/api/account/register',
    //       method: 'post',
    //       data: { username: 'fakename', password: 'pass1234', email: 'fake@abc' }
    //     },
    //     error: AxiosError {
    //       message: 'Error',
    //       name: 'AxiosError',
    //       code: 'ERR_BAD_REQUEST',
    //       config: {
    //         url: '/api/account/register',
    //         method: 'post',
    //         headers: Object [AxiosHeaders] {},
    //         data: [Object]
    //       },
    //       request: {},
    //       response: {
    //         status: 400,
    //         statusText: 'Bad Request',
    //         data: '',
    //         headers: Object [AxiosHeaders] {},
    //         config: [Object]
    //       }
    //     }
    //   }
    expect(mockLogHandler.mock.calls[1][1]).toEqual(Severity.ERROR);
    if (axiosError) {
        expect(mockLogHandler.mock.calls[1][2]['error']).toMatchObject(axiosError);
    }
    if (axiosResponse) {
        expect(mockLogHandler.mock.calls[1][2]['error']['response']).toMatchObject(axiosResponse);
    }
    if (axiosConfig) {
        expect(mockLogHandler.mock.calls[1][2]['config']).toMatchObject(axiosConfig);
    }
}

export function expectLastLogMessageEquals(mockLogHandler: any,
                                           severity: Severity,
                                           message: any): void {
    var i = mockLogHandler.mock.calls.length - 1;
    expect(mockLogHandler.mock.calls[i][1]).toEqual(severity);
    expect(mockLogHandler.mock.calls[i][2]).toMatch(message);
};

export function expectLastLogMessageMatches(mockLogHandler: any,
                                            severity: Severity,
                                            regex: any): void {
    var i = mockLogHandler.mock.calls.length - 1;
    expect(mockLogHandler.mock.calls[i][1]).toEqual(severity);
    expect(mockLogHandler.mock.calls[i][2]['error'].message).toMatch(new RegExp(regex));
};
