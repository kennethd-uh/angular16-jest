import { ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';

// https://testing-angular.com/testing-components/#testing-helpers

export function findDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement {
  return fixture.debugElement.query(
    By.css(`[data-testid="${testId}"]`)
  );
}
export function findTableElement<T>(
    fixture: ComponentFixture<T>,
    testId: string
){
  return fixture.nativeElement.querySelectorAll("#" + testId);
}

// declared async, to allow submitting form directly & awaiting results
export async function submitDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): Promise<void> {
  const element = findDataElement(fixture, testId);
  element.triggerEventHandler('submit', null);
}

export async function clickDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): Promise<void> {
  const element = findDataElement(fixture, testId);
  const event = makeClickEvent(element.nativeElement);
  element.triggerEventHandler('click', event);
}

export function makeClickEvent(
  target: EventTarget
): Partial<MouseEvent> {
  return {
    preventDefault(): void {},
    stopPropagation(): void {},
    stopImmediatePropagation(): void {},
    type: 'click',
    target,
    currentTarget: target,
    bubbles: true,
    cancelable: true,
    button: 0
  };
}

export function expectDataElementTextToBe<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  text: string,
): void {
  const element = findDataElement(fixture, testId);
  const actualText = element.nativeElement.textContent;
  expect(actualText).toBe(text);
}

export function expectDataElementToHaveClass<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  className: string,
): void {
  const element = findDataElement(fixture, testId);
  const actualClassName = element.nativeElement.className
  expect(actualClassName).toBe(className)
}

export function expectDataElementToBeNull<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
  const element = findDataElement(fixture, testId);
  expect(element).toBeNull()
}

export function expectDataElementToExist<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
  const element = findDataElement(fixture, testId);
  expect(element).not.toBeNull()
}

export function expectLinkToBe<T>(
    fixture: ComponentFixture<T>,
    testId: string,
    expectedLink: string,
): void {
  const routerLink = findDataElement(fixture, testId).nativeElement
  expect(routerLink).toBeTruthy() //check if rendered
  expect(routerLink.getAttribute('href')).toEqual(expectedLink); //check if active link
}

export function updateDataElementTextValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  value: string,
): void {
  const element = findDataElement(fixture, testId);
  // see "Fake Input Event" section @
  // https://testing-angular.com/testing-components/#filling-out-forms
  element.nativeElement.value = value;
  element.nativeElement.dispatchEvent(new Event('input'));
}

export function updateTimeOnTimePicker<T>(
  fixture: ComponentFixture<any>,
  testId: string,
  value: Date
): void {
  const input = findDataElement(fixture, testId);
  const tpInstance = input.componentInstance as TimepickerComponent;

  // Set the value of the input
  tpInstance.writeValue(value);

  // Manually trigger Angular's change detection
  fixture.detectChanges();
}

export function updateDateOnBsDatepicker<T>(
    fixture: ComponentFixture<any>,
    testId: string,
    value: Date,
): void {
  const input = findDataElement(fixture, testId);

  // Set the value of the input
  input.nativeElement.value = formatDate(value);

  // Trigger the input event first
  input.nativeElement.dispatchEvent(new Event('input'));

  // Then trigger the change event
  input.nativeElement.dispatchEvent(new Event('change'));

  // Manually trigger Angular's change detection
  fixture.detectChanges();
}

// Helper function to format the date into a string
// Adjust the format as per the datepicker's requirement
export function formatDate(date: Date): string {
  // Example format: 'YYYY-MM-DD'
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export function convertToMMDDYYYY(inputDate: string): string {
  const date = new Date(inputDate);
  const month = padZero(date.getMonth() + 1); // getMonth() returns month from 0-11
  const day = padZero(date.getDate());
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function padZero(number: number): string {
  return number < 10 ? '0' + number : number.toString();
}

export function updateDataElementSelectValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  option: number,
): void {
  const select = findDataElement(fixture, testId).nativeElement;
  select.value = select.options[option].value;
  select.dispatchEvent(new Event('change'));
}

export function updateDataElementCheckValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  value: boolean,
): void {
  const checkbox = findDataElement(fixture, testId).nativeElement;
  checkbox.checked = value;
  checkbox.dispatchEvent(new Event('change'));
}
