import { Builder, By, until } from "selenium-webdriver";
import { ServiceBuilder } from "selenium-webdriver/chrome";
import chromedriver from "chromedriver";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Auth Flow Tests", () => {
  let driver;
  let testEmail;
  const baseUrl = "http://localhost:3000";
  const actionDelay = 1000;

  beforeAll(async () => {
    const service = new ServiceBuilder(chromedriver.path);
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeService(service)
      .build();

    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({
      implicit: 60000,
      pageLoad: 20000,
      script: 30000,
    });
  });

  afterAll(async () => {
    await delay(2000);
    await driver.quit();
  });

  it("should register a new user successfully", async () => {
    await driver.get(`${baseUrl}/register`);
    await delay(2000);

    testEmail = `test${Date.now()}@example.com`;

    await (await driver.findElement(By.id("name"))).sendKeys("Test User");
    await delay(actionDelay);

    await (await driver.findElement(By.id("email"))).sendKeys(testEmail);
    await delay(actionDelay);

    await (await driver.findElement(By.id("password"))).sendKeys("Test@123!");
    await delay(actionDelay);

    await (
      await driver.findElement(By.id("confirmPassword"))
    ).sendKeys("Test@123!");
    await delay(actionDelay);

    const submitButton = await driver.findElement(
      By.css('button[type="submit"]')
    );
    await driver.wait(until.elementIsEnabled(submitButton));
    await delay(actionDelay);
    await submitButton.click();

    await driver.wait(until.urlContains("/login"), 15000);
    await delay(3000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/login");
  }, 40000);

  it("should login successfully with registered credentials", async () => {
    await driver.get(`${baseUrl}/login`);
    await delay(2000);

    const emailField = await driver.findElement(By.id("email"));
    await emailField.clear();
    await emailField.sendKeys(testEmail);
    await delay(actionDelay);

    const passwordField = await driver.findElement(By.id("password"));
    await passwordField.clear();
    await passwordField.sendKeys("Test@123!");
    await delay(actionDelay);

    const loginButton = await driver.findElement(
      By.css('button[type="submit"]')
    );
    await driver.wait(until.elementIsEnabled(loginButton));
    await delay(actionDelay);
    await loginButton.click();

    await driver.wait(until.urlIs(`${baseUrl}/`), 15000);
    await driver.navigate().refresh();
    await delay(3000);

    const welcomeText = await driver
      .findElement(By.css(".hero-section h1"))
      .getText();
    expect(welcomeText).toContain("Welcome to Our Store");

    const logoutBtn = await driver.wait(
      until.elementLocated(By.css(".logout-btn")),
      15000
    );
    await driver.wait(until.elementIsVisible(logoutBtn));
    expect(await logoutBtn.getText()).toMatch(/logout/i);
  }, 40000);

  it("should logout successfully", async () => {
    await driver.navigate().refresh();
    await delay(2000);

    const logoutButton = await driver.wait(
      until.elementLocated(By.css(".logout-btn")),
      15000
    );
    await driver.wait(until.elementIsVisible(logoutButton));
    await driver.wait(until.elementIsEnabled(logoutButton));
    await delay(actionDelay);
    await logoutButton.click();

    await driver.wait(until.urlContains("/login"), 15000);
    await delay(3000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/login");
  }, 40000);

  it("should show error message for invalid login credentials", async () => {
    await driver.get(`${baseUrl}/login`);
    await delay(2000);

    const emailField = await driver.findElement(By.id("email"));
    await emailField.clear();
    await emailField.sendKeys("invalid@example.com");
    await delay(actionDelay);

    const passwordField = await driver.findElement(By.id("password"));
    await passwordField.clear();
    await passwordField.sendKeys("wrongpassword");
    await delay(actionDelay);

    const loginButton = await driver.findElement(
      By.css('button[type="submit"]')
    );
    await driver.wait(until.elementIsEnabled(loginButton));
    await delay(actionDelay);
    await loginButton.click();

    const errorElement = await driver.wait(
      until.elementLocated(By.css(".error-message")),
      15000
    );
    await driver.wait(until.elementIsVisible(errorElement));
    await delay(2000);

    const errorMessage = await errorElement.getText();
    expect(errorMessage).toContain("Invalid email or password");
  }, 40000);
});
