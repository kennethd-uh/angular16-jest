# Angular16Jest

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0.

The intent of this project is to create an Angular16 & Jest environment that parallels a real-world project for the purpose of experimenting with different approaches to testing or varying implementations in isolation, and in a context easier to share for feedback outside of my employer's organization.

Each command or edit has been committed individually, using the command itself as commit message when possible:
```sh
kenneth@bookworm ~/git/angular16-jest (main) $ git log-short --pretty='  %h   %s' --reverse
  aaf8884   ng new --routing --style css --skip-git --strict --minimal angular16-jest && cd angular16-jest && git init && git add .
  9614648   npm install jest jest-environment-jsdom jest-preset-angular @types/jest --save-dev && git add package.json package-lock.json
  50a511e   update angular.json: set "schematics": {}, cli.analytics=false, & add "test" section with "builder" = @angular-devkit/build-angular:jest
  1369cfb   add tsconfig.spec.json, jest.config.ts, src/test.ts; remove comments to make tsconfig.json & tsconfig.app.json valid JSON
  792041a   npm install --save-dev ts-node && git add package.json package-lock.json
  a8b260c   npm install --save-dev ts-jest && git add package.json package-lock.json
  346a9f2   add paths to tsconfig.json
  0bc2d35   add auto-generated src/app/app.component.spec.ts from prev run of 'ng new' without --minimal
  795c42f   npm install ng-mocks   # ng test passes first 3 autogen tests
  4488c8c   npm install --save-dev eslint && git add package.json package-lock.json
  547f709   npm install axios ngx-cookie-service@"^16.0.1" ngx-toastr --save && git add package.json package-lock.json
  38c8d6c   update app.component.ts to use templateUrl & styleUrls rather than inline markup  # builtin tests still pass
  ca1920a   ng generate service core/api
  d86caa9   add ApiService.get() & ApiService.post() methods
  c91c738   first custom test(): 'can mock axios'
  5f23557   add ApiService.get() & ApiService.post() tests
  b17c4c0   add custom intro to README.md
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/docs/).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
