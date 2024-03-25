import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation'], { origin: 'https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery' });
});

test.beforeEach('open', async ({ page }) => {
  await page.goto('https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery');
  await expect(page).toHaveURL(/eda.yandex.ru/);
  console.log('Сайт открыт');
});

// ПРОВЕРКА ВЫБОРА АДРЕСА НА КАТАЛОГЕ - также отдельно в файле addressChooseTests

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
    await expect(addressSelectWindow.getByTestId("address-input")).toHaveValue("улица Ченцова, 48");
});
//при клике по кнопке "ок" закрывается окно с полем ввода адреса и отображается каталог для введенного адреса
test.beforeEach("address suggestion list ok click", async ({ page }) => {
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root');

    await addressSelectWindow.getByTestId("desktop-location-modal-confirm-button").click();
    await expect(addressSelectWindow).not.toBeVisible();
    console.log('Окно выбора адреса скрылось');
    await expect(page.getByTestId("address-button-root")).toContainText("улица Ченцова");
});

/*
//ВЫЖИМКА ИЗ ПРЕДЫДУЩИХ СТРОК - выбор адреса
test.beforeEach('address choose all steps', async ({ page }) => {

    await page.getByTestId('desktop-address-suggestion-select-button').click();
    await page.getByPlaceholder('Введите улицу и дом').fill("Недвиговка");
    await page.getByTestId('desktop-location-modal-root').locator("#react-autowhatever-1--item-0").click();
    await page.getByTestId('desktop-location-modal-root').getByTestId("desktop-location-modal-confirm-button").click();

    await expect(page.getByTestId("address-button-root")).toContainText("улица Ченцова");
});
*/

//ВЫБОР НОВОГО АДРЕСА - - также отдельно в файле addressReChooseTests

//открытие на каталоге попапа со списком адресов при клике по кнопке с выбранным адресом
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

/*
//ВЫЖИМКА ИЗ ПРЕДЫДУЩИХ СТРОК - выбор нового адреса
test.beforeEach('address re-choose all steps', async ({ page }) => {

    await page.getByTestId("address-button-root").getByRole('button').click();
    await page.getByTestId("desktop-popup").getByTestId("address-button-add").click();
    await page.getByPlaceholder('Введите улицу и дом').fill("Привокзальная площадь, 1/2");
    await page.getByTestId('desktop-location-modal-root').locator("#react-autowhatever-1--item-0").click();
    await page.getByTestId('desktop-location-modal-root').getByTestId("desktop-location-modal-confirm-button").click();

    await expect(page.getByTestId("address-button-root")).toContainText("Привокзальная площадь, 1/2");
});
*/


//ПОИСК РЕСТОРАНА
//отображение строки поиска на каталоге
test('search line', async ({ page }) => {
    const searchLine = await page.getByTestId("new-header-root").getByTestId('search-input');

    await expect(page.getByTestId("new-header-root").getByRole('button', { name: 'Найти' })).toBeVisible();
    await expect(searchLine).toHaveAttribute("placeholder", "Найти ресторан, блюдо или товар");
    //хочу найти элемент по классу - пока не нашла, как - upd добавлю по СSS
});

/*
//при клике по строке поиска плейсхолдер не отображается - действительно не отображается, но через поиск по плейсхолдеру элемент находится
test('search line placeholder', async ({ page }) => {
    const searchLine = await page.getByTestId("new-header-root").getByTestId('search-input');

    await searchLine.click();
    await expect(page.getByTestId("new-header-root").getByPlaceholder("Найти ресторан, блюдо или товар")).not.toBeVisible();
});
 */

/*
// тут пока не сильно работающие тесты
//далее еще буду набрасывать проверки
//при вводе текста в строку поиска появляется список с предложениями и кнопка очистки "Х" поля ввода текста
test.beforeEach('search line suggestion list', async ({ page }) => {
    await page.getByTestId("new-header-root").getByTestId('search-input').click();
    await page.getByTestId("new-header-root").getByTestId('search-input').fill("вкуснолюбов ");

   //!!!! await expect(page.getByTestId("new-header-root").getElementsByClassName("b"))
    //прописать проверку появления списка предложений
    await expect(page.getByTestId("new-header-root").getByTestId('search-input').getByTestId('input-clear-button')).toBeVisible();
});
//Скрывается лист с предложениями и кнопка "Х" при клике по кнопке очистки "Х" в строке поиска
test('search line clear button', async ({ page }) => {
    await page.getByTestId("new-header-root").getByTestId('search-input').getByTestId('input-clear-button').click();

    await expect(page.getByTestId("suggestionsList")).not.toBeVisible();
    await expect(page.getByTestId("new-header-root").getByTestId('search-input').getByTestId('input-clear-button')).not.toBeVisible();
});
*/

/*
вопросы по итогу работы:
как искать по индексу
как искать по классу
 */
