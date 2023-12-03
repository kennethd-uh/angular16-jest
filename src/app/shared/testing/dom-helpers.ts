import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

// https://testing-angular.com/testing-components/#testing-helpers

export function findDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement {
  return fixture.debugElement.query(
    By.css(`[data-testid="${testId}"]`)
  );
}

// declared async, to allow submitting form directly & awaiting results
export async function submitDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): Promise<void> {
  const element = findDataElement(fixture, testId);
  await element.triggerEventHandler('submit', null);
}

// TODO: shouldn't this be declared async, as it triggers event handler?
// (it is copied from testing-helpers page linked above)
export function clickDataElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
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

