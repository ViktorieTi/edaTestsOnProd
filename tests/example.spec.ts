import { test, expect, Page} from '@playwright/test';

test.beforeEach('open', async ({ page, context }) => {
    const logo = await page.getByTestId('new-header-logo')

    await context.grantPermissions(['geolocation'], { origin: 'https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery' });
    await page.goto('https://eda.yandex.ru/moscow?lang=ru&shippingType=delivery');

    await expect(logo).toBeInViewport()
    await expect(page).toHaveURL(/eda.yandex.ru/);
});

async function addressChoose (page: Page) {
    const popupChooseAddressButton = await page.getByTestId('desktop-address-suggestion-select-button')
    const windowChooseAddressInput = await page.getByTestId('address-input')
    const windowChooseAddress = await page.getByTestId('desktop-location-modal-root')
    const windowChooseAddressSuggestedElement = await windowChooseAddress.locator("#react-autowhatever-1--item-0")
    const windowChooseAddressButton = await windowChooseAddress.getByTestId("desktop-location-modal-confirm-button")
    const addressButton = await page.locator("#root > div.AppDefaultLayout_root.AppDefaultLayout_main > header > div > div.DesktopHeader_leftBlock > div > div.DesktopHeader_headerItem.DesktopHeader_addressWrapper > div > button")

    await popupChooseAddressButton.click();
    await windowChooseAddressInput.fill("Дорожная 1к1");
    await windowChooseAddressSuggestedElement.click();
    await windowChooseAddressButton.click();

    await expect(addressButton).toContainText("Дорожная улица, 1к1");
}

test('выбор адреса на каталоге',async ({ page }) => {
    const addressPopup = await page.getByTestId("desktop-address-suggestion-root")
    const addressPopupButton = await page.getByTestId('desktop-address-suggestion-select-button')
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root')
    const addressInput = await page.getByPlaceholder('Введите улицу и дом')
    const addressSelectWindowTitle = await addressSelectWindow.getByTestId("desktop-location-modal-title")
    const addressSelectWindowOkButton = await addressSelectWindow.getByTestId("desktop-location-modal-confirm-button")
    const addressSelectWindowMap = await addressSelectWindow.getByTestId("desktop-location-modal-map")
    const addressSelectWindowInput = await addressSelectWindow.getByTestId("address-input")
    const addressSelectWindowInputWithPlaceholder = await addressSelectWindow.getByPlaceholder('Введите улицу и дом')
    const addressSelectWindowCloseCross = await addressSelectWindow.getByTestId("desktop-modal-cross")
    const addressSelectWindowSuggestedElement =  await addressSelectWindow.locator('#react-autowhatever-1')
    const addressSelectWindowInputReset = await addressSelectWindow.getByTestId("address-input-reset")
    const addressButton = await page.getByTestId("address-button-root").getByRole('button')

    await test.step('при открытии каталога показывается попап с просьбой уточнить адрес', async () => {
        await expect(addressPopup).toContainText("Уточните адрес доставки");
        await expect(addressPopup).toContainText("Сейчас вы видите магазины и рестораны в Москве");
        await expect(addressPopup).toContainText(/Выбрать улицу и дом/)
        // прикрепить описание кнопки к кнопке, а не к попапу
    })

    await test.step('после клика по кнопке "Выбрать..." попапа на каталоге открывается окно с картой и полем ввода адреса', async () => {
        await addressPopupButton.click();

        await expect(addressSelectWindowTitle).toHaveText("Укажите адрес доставки")
        await expect(addressSelectWindow).toContainText("Чтобы курьер смог вас найти");
        await expect(addressSelectWindowOkButton).toHaveText("ОК");
        await expect(addressSelectWindowMap).toBeVisible();
        await expect(addressSelectWindowInput).toBeVisible();
        await expect(addressSelectWindowCloseCross).toBeVisible();
    })
    await test.step('при вводе поискового запроса в поле ввода адреса отображаются варианты поисковых запросов', async () => {
        await addressInput.fill("Недвиговка");

        await expect(addressInput).not.toContainText('Введите улицу и дом');
        await expect(addressSelectWindowSuggestedElement).toBeVisible();
    })
    await test.step('при клике по "Х" в поле ввода адреса листбокс с вариантами адресов скрывается', async () => {
        await addressSelectWindowInputReset.click();

        await expect(addressSelectWindowInputWithPlaceholder).toBeVisible();
        await expect(addressSelectWindowSuggestedElement).not.toBeVisible();
        await expect(addressSelectWindowOkButton).toBeDisabled();
    })
    //до введения текста в поле ввода адреса кнопка "ОК" неактивна - пока не придумала, как сделать
    //getByTestId("desktop-location-modal-confirm-button") -- появилась идея, скоро попробую

    await test.step('при клике по адресу в листбоксе с вариантами адресов поле ввода заполняется выбраным адресом', async () => {
        await addressSelectWindowInput.fill("Недвиговка");
        await addressSelectWindow.locator("#react-autowhatever-1--item-0").click();
//!!
        await expect(addressSelectWindowInput).toHaveValue("улица Ченцова, 48");
        await expect(addressSelectWindowOkButton).toBeEnabled();
    })
    await test.step('при клике по кнопке "ок" закрывается окно с полем ввода адреса и отображается каталог для введенного адреса', async () => {
        await addressSelectWindowOkButton.click();

        await expect(addressSelectWindow).not.toBeVisible();
        await expect(addressButton).toContainText("улица Ченцова");
    })
});

test.only('выбор нового адреса',async ({ page }) => {
    const addressButton = await page.getByTestId("address-button-root").getByRole('button')
    const addressListPopup = await page.getByTestId("desktop-popup")
    const addressListPopupAddressList = await addressListPopup.getByRole('option', { name: 'улица' })
    const addressListPopupButtonAdd = await addressListPopup.getByTestId("address-button-add")
    // const addressListPopupChosenAddress = await page.locator("body > div:nth-child(9) > div > div > div > div > button:nth-child(2)")
    const addressListPopupChosenAddress = await page.getByTestId("desktop-popup-list-item").getByText("Дорожная улица, 1к1")
    const addressSelectWindow = await page.getByTestId('desktop-location-modal-root')
    const addressInput = await page.getByPlaceholder('Введите улицу и дом')
    // const popupAddressChooseButton = await page.getByTestId('desktop-address-suggestion-select-button')

    // async function addressChoose (Page) {
    //     const popupChooseAddressButton = await page.getByTestId('desktop-address-suggestion-select-button')
    //     const windowChooseAddressInput = await page.getByTestId('address-input')
    //     const windowChooseAddress = await page.getByTestId('desktop-location-modal-root')
    //     const windowChooseAddressSuggestedElement = await windowChooseAddress.locator("#react-autowhatever-1--item-0")
    //     const windowChooseAddressButton = await windowChooseAddress.getByTestId("desktop-location-modal-confirm-button")
    //     const addressButton = await page.locator("#root > div.AppDefaultLayout_root.AppDefaultLayout_main > header > div > div.DesktopHeader_leftBlock > div > div.DesktopHeader_headerItem.DesktopHeader_addressWrapper > div > button")
    //
    //     await popupChooseAddressButton.click();
    //     await windowChooseAddressInput.fill("Дорожная 1к1");
    //     await windowChooseAddressSuggestedElement.click();
    //     await windowChooseAddressButton.click();
    //
    //     await expect(addressButton).toContainText("Дорожная улица, 1к1");
    // }

    await test.step('предусловие - выбор адреса', async () => {
        await addressChoose (page)
    });

    await test.step('открытие на каталоге попапа со списком адресов при клике по кнопке с выбранным адресом', async () => {
        await addressButton.click();

        await expect(addressListPopup).toBeVisible();
        await expect(addressListPopupButtonAdd).toBeVisible();
        await expect(addressListPopupAddressList).toBeVisible();
        //хотела обойтись без значения в "name", а, например, с использованием индекса, но не нашла пока, как это сделать -- нашла
    });
    await test.step('закрытие на каталоге попапа со списком адресов при клике по ранее выбранному адресу', async () => {
        await expect(addressListPopupChosenAddress).toHaveAttribute("aria-selected", "true");
        await addressListPopupChosenAddress.click();
        //хотела обойтись без значения в "name", а, например, с использованием индекса, но не нашла пока, как это сделать - нашла
        await expect(addressListPopup).not.toBeVisible();
    });
    await test.step('открытие окна с картой и полем ввода адреса при клике по кнопке на попапе "добавить новый адрес"', async () => {
        await addressButton.click();
        await addressListPopup.getByTestId("address-button-add").click();
        // await expect(addressListPopup).not.toBeVisible();
        //думала, что окно скрывается, но, видимо, нет :)
        await expect(page.getByTestId('desktop-location-modal-root')).toBeVisible();
    });
    await test.step('ввод нового адреса', async () => {
        await addressInput.fill("Привокзальная площадь, 1/2");
        await addressSelectWindow.locator("#react-autowhatever-1--item-0").click();
        await page.getByTestId('desktop-location-modal-confirm-button').click();

        await expect(page.getByTestId("address-button-root")).toContainText("Привокзальная площадь, 1/2");
    });
});

//далее будут более еще тесты
//но пока их нет :)
test ('открытие магазина с магазин-листа',async ({ page }) => {
    const addressButton = await page.getByTestId('desktop-address-suggestion-select-button')
    const addressInputField = await page.getByPlaceholder('Введите улицу и дом')
    const elementOfAddressSuggList = await page.getByTestId('desktop-location-modal-root').locator("#react-autowhatever-1--item-0")


    //надо бы на это все одну функцию завести
    await test.step('предусловие - выбор адреса', async () => {
        await addressButton.click();
        await addressInputField.fill("Дорожная 1к1");
        await elementOfAddressSuggList.click();
        await page.getByTestId('desktop-location-modal-root').getByTestId("desktop-location-modal-confirm-button").click();

        await expect(page.getByTestId("address-button-root")).toContainText("улица");
    })

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
// test('search line', async ({ page }) => {
//     const searchLine = await page.getByTestId("new-header-root").getByTestId('search-input');
//
//     await expect(page.getByTestId("new-header-root").getByRole('button', { name: 'Найти' })).toBeVisible();
//     await expect(searchLine).toHaveAttribute("placeholder", "Найти ресторан, блюдо или товар");
//     //хочу найти элемент по классу - пока не нашла, как - upd добавлю по СSS
// });

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