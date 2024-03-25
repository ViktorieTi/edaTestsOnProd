import { test, expect } from '@playwright/test';

//ВЫБОР НОВОГО АДРЕСА
//открытие на каталоге попапа со списком адресов при клике по кнопке с выбранным адресом
import {expect, test} from "@playwright/test";

test.beforeEach('address list popup', async ({ page }) => {
    const addressButton = await page.getByTestId("address-button-root").getByRole('button');

    await addressButton.click();
    await expect(page.getByTestId("desktop-popup")).toBeVisible();
    await expect(page.getByTestId("desktop-popup").getByTestId("address-button-add")).toBeVisible();
    await expect(page.getByTestId("desktop-popup").getByRole('option', { name: 'улица Ченцова,' })).toBeVisible();
    //хотела обойтись без значения в "name", а, например, с использованием индекса, но не нашла пока, как это сделать
});
//закрытие на каталоге попапа со списком адресов при клике по ранее выбранному адресу
test.beforeEach('address list popup close by chosen address', async ({ page }) => {
    const addressListPopup = await page.getByTestId("desktop-popup")

    await addressListPopup.getByRole('option', { name: 'улица Ченцова,' }).click();
    //хотела обойтись без значения в "name", а, например, с использованием индекса, но не нашла пока, как это сделать
    await expect(addressListPopup).not.toBeVisible();
});
//открытие окна с картой и полем ввода адреса при клике по кнопке на попапе "добавить новый адрес"
test.beforeEach('address list popup close by chosen address', async ({ page }) => {
    const addressButton = await page.getByTestId("address-button-root").getByRole('button');
    const addressListPopup = await page.getByTestId("desktop-popup");

    await addressButton.click();
    await addressListPopup.getByTestId("address-button-add").click();
    // await expect(addressListPopup).not.toBeVisible();
    //думала, что окно скрывается, но, видимо, нет :)
    await expect(page.getByTestId('desktop-location-modal-root')).toBeVisible();
});
//ввод нового адреса
test('address re-choose', async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');
    const addressInput = await page.getByPlaceholder('Введите улицу и дом');

    await addressInput.fill("Привокзальная площадь, 1/2");
    await addressSelectWindow.locator("#react-autowhatever-1--item-0").click();
    await addressSelectWindow.getByTestId("desktop-location-modal-confirm-button").click();

    await expect(page.getByTestId("address-button-root")).toContainText("Привокзальная площадь, 1/2");
});