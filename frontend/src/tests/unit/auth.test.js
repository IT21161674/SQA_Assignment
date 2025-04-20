// Change from CommonJS to ES Module imports
import { Builder, By, until } from "selenium-webdriver";
import { ServiceBuilder } from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';

// Helper function to add delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Auth Flow Tests", () => {
  let driver;
  let testEmail;
  const baseUrl = "http://localhost:3000";
  const actionDelay = 1000; // 1 second delay between actions

  beforeAll(async () => {
    // Use ServiceBuilder with the ChromeDriver path for Windows compatibility
    const service = new ServiceBuilder(chromedriver.path);
    driver = await new Builder()
      .forBrowser('chrome')
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
    await delay(2000); // Wait before quitting
    await driver.quit();
  });

  it("should register a new user successfully", async () => {
    await driver.get(`${baseUrl}/register`);
    await delay(2000); // Wait for page load

    // Wait for register page to load
    await driver.wait(until.elementLocated(By.id("name")), 15000);
    await delay(actionDelay);

    // Generate unique email for testing
    testEmail = `test${Date.now()}@example.com`;

    // Fill registration form with explicit waits and delays
    const nameField = await driver.wait(until.elementLocated(By.id("name")));
    await nameField.sendKeys("Test User");
    await delay(actionDelay);

    const emailField = await driver.wait(until.elementLocated(By.id("email")));
    await emailField.sendKeys(testEmail);
    await delay(actionDelay);

    const passwordField = await driver.wait(
      until.elementLocated(By.id("password"))
    );
    await passwordField.sendKeys("Test@123!");
    await delay(actionDelay);

    const confirmPasswordField = await driver.wait(
      until.elementLocated(By.id("confirmPassword"))
    );
    await confirmPasswordField.sendKeys("Test@123!");
    await delay(actionDelay);

    // Submit form
    const submitButton = await driver.wait(
      until.elementLocated(By.css('.register-button')),
      10000
    );
    await driver.wait(until.elementIsEnabled(submitButton));
    await delay(actionDelay);
    await submitButton.click();

    // Wait for redirect to login page with longer timeout
    await driver.wait(until.urlContains("/login"), 15000);
    await delay(3000); // Extra wait after redirect

    // Verify redirect to login page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/login");
  }, 40000); // Increased timeout

  it("should login successfully with registered credentials", async () => {
    await driver.get(`${baseUrl}/login`);
    await delay(2000); // Wait for page load

    // Wait for login form to load
    await driver.wait(until.elementLocated(By.id("email")), 15000);
    await delay(actionDelay);

    const emailField = await driver.findElement(By.id("email"));
    await emailField.clear();
    await emailField.sendKeys(testEmail);
    await delay(actionDelay);

    const passwordField = await driver.findElement(By.id("password"));
    await passwordField.clear();
    await passwordField.sendKeys("Test@123!");
    await delay(actionDelay);

    // Submit form
    const loginButton = await driver.wait(
      until.elementLocated(By.css('.login-button')),
      10000
    );
    await driver.wait(until.elementIsEnabled(loginButton));
    await delay(actionDelay);
    await loginButton.click();

    // Wait for redirect to home page and user info to load
    await driver.wait(until.urlIs(`${baseUrl}/`), 15000);
    await driver.wait(until.elementLocated(By.css(".user-info h2")), 15000);
    await delay(3000); // Extra wait for content to load

    // Verify user is logged in
    const welcomeText = await driver
      .findElement(By.css(".user-info h2"))
      .getText();
    expect(welcomeText).toContain("Welcome, Test User");
  }, 40000); // Increased timeout

  it("should logout successfully", async () => {
    await delay(2000); // Wait before starting logout

    // Wait for logout button to be present and clickable
    const logoutButton = await driver.wait(
      until.elementLocated(By.css("button.logout-btn")),
      15000
    );
    await driver.wait(until.elementIsVisible(logoutButton));
    await driver.wait(until.elementIsEnabled(logoutButton));
    await delay(actionDelay);
    await logoutButton.click();

    // Wait for redirect to login page
    await driver.wait(until.urlContains("/login"), 15000);
    await delay(3000); // Extra wait after redirect

    // Verify redirect to login page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/login");
  }, 40000); // Increased timeout

  it("should show error for invalid login", async () => {
    await driver.get(`${baseUrl}/login`);
    await delay(2000); // Wait for page load

    // Wait for login form to load
    await driver.wait(until.elementLocated(By.id("email")), 15000);
    await delay(actionDelay);

    // Fill login form with invalid credentials
    const emailField = await driver.findElement(By.id("email"));
    await emailField.clear();
    await emailField.sendKeys("invalid@example.com");
    await delay(actionDelay);

    const passwordField = await driver.findElement(By.id("password"));
    await passwordField.clear();
    await passwordField.sendKeys("wrongpassword");
    await delay(actionDelay);

    // Submit form
    const loginButton = await driver.wait(
      until.elementLocated(By.css('.login-button')),
      10000
    );
    await driver.wait(until.elementIsEnabled(loginButton));
    await delay(actionDelay);
    await loginButton.click();

    // Wait for error message to appear
    const errorElement = await driver.wait(
      until.elementLocated(By.css(".error-message")),
      15000
    );
    await driver.wait(until.elementIsVisible(errorElement)), 10000;
    await delay(2000); // Extra wait for error message

    // Verify error message is displayed
    const errorMessage = await errorElement.getText();
    expect(errorMessage).toContain("Invalid email or password");
  }, 40000);
});