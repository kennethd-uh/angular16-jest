import { Injectable } from '@angular/core';

// numeric severity values allow for mathematical threshold implementation for
// handlers; ts enums also provide reverse mapping so Severity[10] == "DEBUG"
// https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
export enum Severity {
    DEBUG = 10,
    INFO = 20,
    WARNING = 30,
    ERROR = 40,
}

export abstract class BaseLogHandler {
  public abstract log(datestr: string, severity: Severity, msg: any): Promise<void>;
}

export class ConsoleLogHandler extends BaseLogHandler {
  public async log(datestr: string, severity: Severity, msg: any): Promise<void> {
    // reverse-map Severity value back to human-readable name
    console.log(datestr, Severity[severity], msg);
  }
}

export class AppInsightsLogHandler extends BaseLogHandler {
  public async log(datestr: string, severity: Severity, msg: any): Promise<void> {
    // TODO AppInsightsLogService.log(msg);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  handlers: BaseLogHandler[] = [];

  constructor() {
    this.handlers.push(new ConsoleLogHandler());
  }

  addHandler(logHandler: BaseLogHandler) {
    this.handlers.push(logHandler);
  }

  now() {
    return new Date().toISOString();
  }

  async log(severity: Severity, msg: any) {
    // datestr should be exactly the same for all handlers
    var datestr: string = this.now();

    for (var i = 0; i < this.handlers.length; i++) {
      var handler: BaseLogHandler = this.handlers[i];
      handler.log(datestr, severity, msg);
    }
  }

  async error(msg: any) { this.log(Severity.ERROR, msg); }
  async warning(msg: any) { this.log(Severity.WARNING, msg); }
  async info(msg: any) { this.log(Severity.INFO, msg); }
  async debug(msg: any) { this.log(Severity.DEBUG, msg); }
}
