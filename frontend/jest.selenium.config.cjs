// jest.selenium.config.cjs
module.exports = {
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/tests/selenium/**/*.test.{js,jsx}"],
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest"
    }
  };