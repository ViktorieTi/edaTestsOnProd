import { test, expect } from '@playwright/test';

// ПРОВЕРКА ВЫБОРА АДРЕСА НА КАТАЛОГЕ

test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation'], { origin: 'https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery' });
});

test.beforeEach('open', async ({ page }) => {
    await page.goto('https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery');
    await expect(page).toHaveURL(/eda.yandex.ru/);
    console.log('Сайт открыт');
});

// При открытии каталога показывается попап с просьбой уточнить адрес
test.beforeEach('enter address popup', async ({ page }) => {
    const addressPopup = await page.getByTestId("desktop-address-suggestion-root");
    // await expect(addressPopup).toBeVisible()
    await expect(addressPopup).toContainText("Уточните адрес доставки")
    await expect(addressPopup).toContainText("Сейчас вы видите магазины и рестораны в Москве")
    await expect(addressPopup).toContainText(/Выбрать улицу и дом/)
    // прикрепить описание кнопки к кнопке, а не к попапу
});
// После клика по кнопке "Выбрать..." попапа на каталоге открывается окно с картой и полем ввода адреса
test.beforeEach("address select window", async ({ page }) => {
    const addressPopupButton = await page.getByTestId('desktop-address-suggestion-select-button');
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');

    await addressPopupButton.click();
    await expect(addressSelectWindow.getByTestId("desktop-location-modal-title")).toHaveText("Укажите адрес доставки")
    await expect(addressSelectWindow).toContainText("Чтобы курьер смог вас найти");
    await expect(addressSelectWindow.getByTestId("desktop-location-modal-confirm-button")).toHaveText("ОК");
    await expect(addressSelectWindow.getByTestId("desktop-location-modal-map")).toBeVisible();
    await expect(addressSelectWindow.getByTestId("address-input")).toBeVisible();
    await expect(addressSelectWindow.getByTestId("desktop-modal-cross")).toBeVisible();
    console.log('Попап открыт');
});
//при вводе поискового запроса в поле ввода адреса отображаются варианты поисковых запросов
test.beforeEach("address suggestion list", async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');
    const addressInput = await page.getByPlaceholder('Введите улицу и дом');

    await addressInput.fill("Недвиговка");
    await expect(addressInput).not.toContainText('Введите улицу и дом');
    await expect(addressSelectWindow.locator('#react-autowhatever-1')).toBeVisible();
    console.log('Отобразился listbox с вариантами адресов');
});
// при клике по "Х" в поле ввода адреса листбокс с вариантами адресов скрывается
test.beforeEach("address suggestion list remove text", async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');

    await addressSelectWindow.getByTestId("address-input-reset").click();
    await expect(addressSelectWindow.getByPlaceholder('Введите улицу и дом')).toBeVisible();
    await expect(addressSelectWindow.locator('#react-autowhatever-1')).not.toBeVisible();
    console.log('Listbox с вариантами адресов скрылся');
});

//до введения текста в поле ввода адреса кнопка "ОК" неактивна - пока не придумала, как сделать
//getByTestId("desktop-location-modal-confirm-button")

//при клике по адресу в листбоксе с вариантами адресов поле ввода заполняется выбраным адресом
test.beforeEach("address suggestion list choose address", async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');

    await addressSelectWindow.getByTestId("address-input").fill("Недвиговка");
    await addressSelectWindow.locator("#react-autowhatever-1--item-0").click();
    // await addressSelectWindow.getByTestId("react-autowhatever-1--item-0").click(); - не получилось найти по id, не знаю, почему
    await expect(addressSelectWindow.getByTestId("address-input")).toHaveValue("улица Ченцова, 48");
});
//при клике по кнопке "ок" закрывается окно с полем ввода адреса и отображается каталог для введенного адреса
test("address suggestion list ok click", async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');

    await addressSelectWindow.getByTestId("desktop-location-modal-confirm-button").click();
    await expect(addressSelectWindow).not.toBeVisible();
    console.log('Окно выбора адреса скрылось');
    await expect(page.getByTestId("address-button-root")).toBeVisible();
});
