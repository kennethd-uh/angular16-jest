import { TestBed } from '@angular/core/testing';

import { LogService, ConsoleLogHandler, AppInsightsLogHandler, Severity } from './log.service';

describe('LogService', () => {
  let service: LogService;
  let mockConsoleLog: any;
  let mockAppInsightsLog: any;
  let mockLogServiceNow: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ],
      providers: [ ]
    });
    service = TestBed.inject(LogService);

    mockConsoleLog = jest.spyOn(ConsoleLogHandler.prototype, 'log')
      .mockImplementation(async(datestr: string, severity: Severity, msg: any) => {});

    mockAppInsightsLog = jest.spyOn(AppInsightsLogHandler.prototype, 'log')
      .mockImplementation(async(datestr: string, severity: Severity, msg: any) => {});

    mockLogServiceNow = jest.spyOn(service, 'now').mockReturnValue('the time is now');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  test('LogService automatically adds ConsoleLog to handlers & passes Severity appropriately', async () => {
    service.debug("debug message");
    service.info("info message");
    service.warning("warning message");
    service.error("error message");
    expect(mockConsoleLog.mock.calls).toEqual([
      ['the time is now', Severity.DEBUG, 'debug message'],
      ['the time is now', Severity.INFO, 'info message'],
      ['the time is now', Severity.WARNING, 'warning message'],
      ['the time is now', Severity.ERROR, 'error message'],
    ]);
  });

  test('LogService.log() calls log() with expected args for all registered handlers', async () => {
    service.addHandler(new AppInsightsLogHandler());
    service.debug("debug message");
    expect(mockConsoleLog.mock.calls).toEqual([
      ['the time is now', Severity.DEBUG, 'debug message'],
    ]);
    expect(mockAppInsightsLog.mock.calls).toEqual([
      ['the time is now', Severity.DEBUG, 'debug message'],
    ]);
  });

});
