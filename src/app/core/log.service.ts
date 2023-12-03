import { Injectable } from '@angular/core';

export abstract class BaseLogHandler {
  // TODO logLevel: LogLevel = LOG_LEVEL;
  abstract log(msg: any): void;
}

export class ConsoleLogHandler extends BaseLogHandler {
  log(msg: any): void { console.log(msg); }
}

export class AppInsightsLogHandler extends BaseLogHandler {
  log(msg: any): void {
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

  log(msg: any) {
    var datestr: string = new Date().toISOString();
    var msgstr: string = JSON.stringify(msg);

    for (var i = 0; i < this.handlers.length; i++) {
      var handler: BaseLogHandler = this.handlers[i];
      console.log(handler);
      handler.log(datestr + ": " + msgstr);
    }
  }

  error(msg: any) { this.log('ERROR: ' + msg); }
  warning(msg: any) { this.log('WARNING: ' + msg); }
  info(msg: any) { this.log('INFO: ' + msg); }
  debug(msg: any) { this.log('DEBUG: ' + msg); }
}
