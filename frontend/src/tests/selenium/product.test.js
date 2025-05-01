import { Builder, By, until, Key } from "selenium-webdriver";
import { ServiceBuilder } from "selenium-webdriver/chrome";
import chromedriver from "chromedriver";
import path from "path";
import fs from "fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Product Management Tests", () => {
  let driver;
  const baseUrl = "http://localhost:3000";
  const actionDelay = 500; // Reduced delay
  const testProductName = `Test Product ${Date.now()}`;
  const updatedProductName = `Updated ${testProductName}`;
  let testProductId;

  beforeAll(async () => {
    if (!driver) {
      try {
        const service = new ServiceBuilder(chromedriver.path);
        driver = await new Builder()
          .forBrowser("chrome")
          .setChromeService(service)
          .build();

        await driver.manage().window().maximize();
        await driver.manage().setTimeouts({
          implicit: 30000,
          pageLoad: 30000,
          script: 30000,
        });
      } catch (error) {
        if (error.message.includes("ChromeDriver only supports Chrome version")) {
          console.error("\nChrome version mismatch detected!");
          console.error("Please run: npm uninstall chromedriver && npm install chromedriver@YOUR_CHROME_VERSION\n");
        }
        throw error;
      }
    }
  }, 30000);

  afterAll(async () => {
    if (driver) {
      await delay(1000);
      await driver.quit();
    }
  }, 10000);

  it("should add a new product successfully", async () => {
    try {
      await driver.get(`${baseUrl}/admin`);
      await delay(1000);

      const categorySelect = await driver.wait(until.elementLocated(By.name("category")), 5000);
      await categorySelect.click();
      await delay(actionDelay);

      await categorySelect.sendKeys("Books");
      await categorySelect.sendKeys(Key.ENTER);
      await delay(actionDelay);

      try {
        const testImagePath = path.resolve(__dirname, "../../../public/test-image.svg");
        if (fs.existsSync(testImagePath)) {
          const uploadInput = await driver.wait(until.elementLocated(By.name("image")), 5000);
          await uploadInput.sendKeys(testImagePath);
          await delay(actionDelay);
        }
      } catch (error) {
        console.warn("Error with image upload:", error.message);
      }

      await driver.executeScript(`
        function setNativeValue(element, value) {
          const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
          const prototype = Object.getPrototypeOf(element);
          const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
          
          if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
          } else {
            valueSetter.call(element, value);
          }
          
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const nameInput = document.querySelector('input[name="name"]');
        const priceInput = document.querySelector('input[name="price"]');
        const descInput = document.querySelector('textarea[name="description"]');
        const categorySelect = document.querySelector('select[name="category"]');
        
        setNativeValue(nameInput, "${testProductName}");
        setNativeValue(priceInput, "99.99");
        setNativeValue(descInput, "This is a test product description");
        
        categorySelect.value = "Books";
        categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
        
        return new Promise(resolve => {
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
              resolve(true);
            } else {
              resolve(false);
            }
          }, 500);
        });
      `);

      await delay(3000);
      await driver.navigate().refresh();
      await delay(1000);

      const productCards = await driver.findElements(By.css(".product-card"));
      let found = false;

      for (const card of productCards) {
        const nameElement = await card.findElement(By.css("h3"));
        const productName = await nameElement.getText();

        if (productName === testProductName) {
          found = true;
          const editButton = await card.findElement(By.css("button:nth-child(1)"));
          await editButton.click();
          await delay(1000);

          const currentUrl = await driver.getCurrentUrl();
          testProductId = currentUrl.split("id=")[1];

          try {
            await driver.executeScript(`
              const cancelButton = document.querySelector('button[type="button"]');
              if (cancelButton) {
                cancelButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                  cancelButton.click();
                }, 500);
                return true;
              }
              return false;
            `);
            await delay(1000);
          } catch (cancelError) {
            await driver.get(`${baseUrl}/admin`);
            await delay(1000);
          }

          break;
        }
      }

      expect(found).toBe(true);
    } catch (error) {
      console.error("Error in add product test:", error.message);
      throw error;
    }
  }, 60000);

  // Test case for editing a product
  it("should edit a product successfully", async () => {
    try {
      await driver.get(`${baseUrl}/admin`);
      await delay(1000);

      await driver.executeAsyncScript(`
        const callback = arguments[arguments.length - 1];
        const formData = new FormData();
        formData.append('name', '${testProductName}');
        formData.append('price', '99.99');
        formData.append('description', 'Test description');
        formData.append('category', 'Books');
        
        fetch('http://localhost:5000/api/products', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          callback({success: true, productId: data.id});
        })
        .catch(err => {
          callback({success: false, error: err.message});
        });
      `).then(result => {
        if (result.success) {
          testProductId = result.productId;
        }
      });

      await driver.navigate().refresh();
      await delay(1000);

      const found = await driver.executeScript(`
        const cards = document.querySelectorAll(".product-card");
        for (const card of cards) {
          const nameElement = card.querySelector("h3");
          if (nameElement.textContent === "${testProductName}") {
            const editBtn = card.querySelector("button:nth-child(1)");
            if (editBtn) {
              editBtn.click();
              return true;
            }
          }
        }
        return false;
      `);

      await delay(1000);

      await driver.executeScript(`
        function setNativeValue(element, value) {
          const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
          const prototype = Object.getPrototypeOf(element);
          const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
          
          if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
          } else {
            valueSetter.call(element, value);
          }
          
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const nameInput = document.querySelector('input[name="name"]');
        const descInput = document.querySelector('textarea[name="description"]');
        
        if (nameInput) {
          setNativeValue(nameInput, "${updatedProductName}");
        }
        if (descInput) {
          setNativeValue(descInput, "This is an updated product description");
        }
        
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
          }
        }, 500);
      `);

      await delay(3000);
      await driver.navigate().refresh();
      await delay(1000);

      const productUpdated = await driver.executeScript(`
        const cards = document.querySelectorAll(".product-card");
        for (const card of cards) {
          const nameElement = card.querySelector("h3");
          if (nameElement.textContent === "${updatedProductName}") {
            return true;
          }
        }
        return false;
      `);

      expect(productUpdated).toBe(true);
    } catch (error) {
      console.error("Error in edit product test:", error.message);
      throw error;
    }
  }, 60000);

  // Test case for deleting a product
  it("should delete a product successfully", async () => {
    try {
      await driver.get(`${baseUrl}/admin`);
      await delay(1000);

      if (!testProductId) {
        const result = await driver.executeAsyncScript(`
          const callback = arguments[arguments.length - 1];
          const formData = new FormData();
          formData.append('name', '${updatedProductName}');
          formData.append('price', '99.99');
          formData.append('description', 'Test description for deletion');
          formData.append('category', 'Books');
          
          fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            callback({success: true, productId: data.id});
          })
          .catch(err => {
            callback({success: false, error: err.message});
          });
        `);

        if (result.success) {
          testProductId = result.productId;
        }

        await driver.navigate().refresh();
        await delay(1000);
      }

      await driver.executeScript("window.confirm = function() { return true; }");

      const productDeleted = await driver.executeScript(`
        const cards = document.querySelectorAll(".product-card");
        for (const card of cards) {
          const nameElement = card.querySelector("h3");
          if (nameElement.textContent === "${updatedProductName}") {
            const deleteBtn = card.querySelector("button:nth-child(2)");
            if (deleteBtn) {
              deleteBtn.click();
              return true;
            }
          }
        }
        return false;
      `);

      await delay(2000);
      await driver.navigate().refresh();
      await delay(1000);

      const productFound = await driver.executeScript(`
        const cards = document.querySelectorAll(".product-card");
        for (const card of cards) {
          const nameElement = card.querySelector("h3");
          if (nameElement.textContent === "${updatedProductName}") {
            return true;
          }
        }
        return false;
      `);

      expect(productFound).toBe(false);
    } catch (error) {
      console.error("Error in delete product test:", error.message);
      throw error;
    }
  }, 60000);

  // Test case for showing validation errors
  it("should show validation errors when submitting an empty form", async () => {
    try {
      await driver.get(`${baseUrl}/admin`);
      await delay(1000);

      await driver.executeScript(`
        document.querySelector('input[name="name"]').value = "";
        document.querySelector('input[name="price"]').value = "";
        document.querySelector('textarea[name="description"]').value = "";
        document.querySelector('select[name="category"]').selectedIndex = 0;
      `);
      await delay(actionDelay);

      const submitButton = await driver.findElement(By.css('form button[type="submit"]'));
      await submitButton.click();
      await delay(1000);

      const validationMessages = await driver.executeScript(
        "return Array.from(document.querySelectorAll('input:invalid, textarea:invalid, select:invalid')).length"
      );

      expect(validationMessages).toBeGreaterThan(0);
    } catch (error) {
      console.error("Error in validation test:", error.message);
      throw error;
    }
  }, 30000);

  // Test case for searching products
  it("should search for products correctly", async () => {
    try {
      await driver.get(baseUrl);
      await delay(2000);

      const uniqueProductName = `Search Test ${Date.now()}`;
      
      const createResult = await driver.executeAsyncScript(`
        const callback = arguments[arguments.length - 1];
        
        const formData = new FormData();
        formData.append('name', '${uniqueProductName}');
        formData.append('price', '49.99');
        formData.append('description', 'This is a special product for search testing');
        formData.append('category', 'Electronics');
        
        fetch('http://localhost:5000/api/products', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          callback({success: true, productId: data.id});
        })
        .catch(err => {
          callback({success: false, error: err.message});
        });
      `);
      
      if (createResult.success) {
        console.log(`Created test product with ID: ${createResult.productId}`);
      } else {
        console.error(`Failed to create test product: ${createResult.error}`);
        throw new Error("Failed to create test product for search");
      }
      
      await delay(2000);
      
      console.log(`Searching for unique product: "${uniqueProductName}"`);
      
      const searchInput = await driver.findElement(By.css('input[type="search"], input[placeholder*="search"], input.search-input'));
      await searchInput.clear();
      await searchInput.sendKeys(uniqueProductName);
      await searchInput.sendKeys(Key.ENTER);
      
      await delay(3000);

      const foundProduct = await driver.executeScript(`
        const cards = document.querySelectorAll(".product-card h3");
        for (const card of cards) {
          if (card.textContent.includes("${uniqueProductName}")) {
            return true;
          }
        }
        return false;
      `);
      
      console.log(`Product found in search results: ${foundProduct}`);
      expect(foundProduct).toBe(true);
      
      console.log("Searching for non-existent product");
      
      await driver.get(baseUrl);
      await delay(2000);
      
      const newSearchInput = await driver.findElement(By.css('input[type="search"], input[placeholder*="search"], input.search-input'));
      
      await newSearchInput.clear();
      const randomQuery = `NonExistentProduct${Math.floor(Math.random() * 10000)}`;
      await newSearchInput.sendKeys(randomQuery);
      await newSearchInput.sendKeys(Key.ENTER);
      
      await delay(3000);
      
      const noResultsMessage = await driver.executeScript(`
        const noResultsHeader = document.querySelector("h3");
        return noResultsHeader && noResultsHeader.textContent.includes("No products found");
      `);
      
      console.log(`"No products found" message displayed: ${noResultsMessage}`);
      expect(noResultsMessage).toBe(true);
      
      const searchTermDisplayed = await driver.executeScript(`
        const paragraph = document.querySelector("p");
        return paragraph && paragraph.textContent.includes("${randomQuery}");
      `);
      
      console.log(`Search term displayed in message: ${searchTermDisplayed}`);
      expect(searchTermDisplayed).toBe(true);
      
      console.log("Testing 'Return to Home' button");
      
      const returnButton = await driver.findElement(By.linkText("Return to Home"));
      await returnButton.click();
      
      await delay(2000); // Wait for navigation
      
      // Verify we're back on the home page
      const homePageCheck = await driver.executeScript(`
        return {
          isHomePage: document.title.includes("Home") || 
                     document.querySelectorAll(".product-card").length > 0,
          productCount: document.querySelectorAll(".product-card").length
        };
      `);
      
      console.log(`Back on home page: ${homePageCheck.isHomePage}`);
      console.log(`Number of products visible: ${homePageCheck.productCount}`);
      
      expect(homePageCheck.isHomePage).toBe(true);
      expect(homePageCheck.productCount).toBeGreaterThan(0);
      
      // Clean up: Delete the test product
      if (createResult.productId) {
        console.log(`Cleaning up: Deleting test product with ID ${createResult.productId}`);
        await driver.executeAsyncScript(`
          const callback = arguments[arguments.length - 1];
          
          fetch('http://localhost:5000/api/products/${createResult.productId}', {
            method: 'DELETE'
          })
          .then(() => {
            callback({success: true});
          })
          .catch(err => {
            callback({success: false, error: err.message});
          });
        `);
      }
      
    } catch (error) {
      console.error("Error in search products test:", error.message);
      throw error;
    }
  }, 60000);
});