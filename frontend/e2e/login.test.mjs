import test from "node:test";
import assert from "node:assert/strict";
import { Builder, By, Key, until } from "selenium-webdriver";

const BASE_URL = "http://localhost:5173";
const TEST_EMAIL = process.env.E2E_EMAIL;
const TEST_PASSWORD = process.env.E2E_PASSWORD;

async function createDriver() {
  return new Builder().forBrowser("chrome").build();
}

test("E2E-01: login exitoso redirige al dashboard", { concurrency: false }, async () => {
  assert.ok(TEST_EMAIL, "Define E2E_EMAIL antes de ejecutar la prueba");
  assert.ok(TEST_PASSWORD, "Define E2E_PASSWORD antes de ejecutar la prueba");

  const driver = await createDriver();

  try {
    await driver.get(BASE_URL);

    await driver.findElement(By.id("login-email")).sendKeys(TEST_EMAIL);
    await driver.findElement(By.id("login-password")).sendKeys(TEST_PASSWORD);
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlContains("/dashboard"), 10000);

    assert.ok((await driver.getCurrentUrl()).includes("/dashboard"));
  } finally {
    await driver.quit();
  }
});

test("E2E-02: credenciales inválidas bloquean el acceso", { concurrency: false }, async () => {
  const driver = await createDriver();

  try {
    await driver.get(BASE_URL);

    await driver.findElement(By.id("login-email")).sendKeys("noexiste@prueba.com");
    await driver.findElement(By.id("login-password")).sendKeys("ClaveInvalida123!");
    await driver.findElement(By.css('button[type="submit"]')).click();

    const modal = await driver.wait(
      until.elementLocated(By.css('[role="dialog"]')),
      10000
    );

    await driver.wait(until.elementIsVisible(modal), 5000);

    const title = await driver.findElement(
      By.id("notification-modal-title")
    ).getText();
    const message = await driver.findElement(
      By.id("notification-modal-message")
    ).getText();

    assert.equal(title, "Error de Acceso");
    assert.match(message, /Credenciales incorrectas|Error de conexión|Demasiados intentos/i);
    assert.ok(!(await driver.getCurrentUrl()).includes("/dashboard"));
  } finally {
    await driver.quit();
  }
});

test("E2E-03: el formulario permite navegación con teclado", { concurrency: false }, async () => {
  const driver = await createDriver();

  try {
    await driver.get(BASE_URL);

    const email = await driver.findElement(By.id("login-email"));
    const password = await driver.findElement(By.id("login-password"));
    const submit = await driver.findElement(By.css('button[type="submit"]'));

    await email.click();
    await email.sendKeys(Key.TAB);

    assert.equal(
      await driver.executeScript("return document.activeElement.id"),
      "login-password"
    );

    await password.sendKeys(Key.TAB);

    assert.equal(
      await driver.executeScript(
        "return document.activeElement === arguments[0]",
        submit
      ),
      true
    );
  } finally {
    await driver.quit();
  }
});

test("E2E-04: el enlace de registro navega a /register", { concurrency: false }, async () => {
  const driver = await createDriver();

  try {
    await driver.get(BASE_URL);

    await driver.findElement(
      By.linkText("Regístrate aquí")
    ).click();

    await driver.wait(until.urlContains("/register"), 5000);

    assert.ok((await driver.getCurrentUrl()).includes("/register"));
  } finally {
    await driver.quit();
  }
});

test("E2E-05: el botón de tema actualiza su etiqueta accesible", { concurrency: false }, async () => {
  const driver = await createDriver();

  try {
    await driver.get(BASE_URL);

    const themeButton = await driver.findElement(
      By.css('button[aria-label^="Cambiar a modo"]')
    );

    const previousLabel = await themeButton.getAttribute("aria-label");

    await themeButton.click();

    await driver.wait(async () => {
      const currentLabel = await themeButton.getAttribute("aria-label");
      return currentLabel !== previousLabel;
    }, 5000);

    const currentLabel = await themeButton.getAttribute("aria-label");

    assert.notEqual(currentLabel, previousLabel);
  } finally {
    await driver.quit();
  }
});
