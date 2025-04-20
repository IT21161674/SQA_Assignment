// This is a mock authentication service since we aren't connecting to a real backend
// In a real application, this would make API calls to your server

// Mock user database
const users = JSON.parse(localStorage.getItem("users")) || [];

// Save users to localStorage
const saveUsers = () => {
  localStorage.setItem("users", JSON.stringify(users));
};

// Authentication state management
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("currentUser")) || null;
};

const setCurrentUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

const removeCurrentUser = () => {
  localStorage.removeItem("currentUser");
};

const isAuthenticated = () => {
  return !!getCurrentUser();
};

// User registration
export const registerUser = async (name, email, password) => {
  // Check if user already exists
  if (users.find((user) => user.email === email)) {
    throw new Error("User already exists with this email");
  }

  // Create new user
  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  saveUsers();

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// User login
export const loginUser = async (email, password) => {
  // Find user by email and password
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  setCurrentUser(userWithoutPassword);
  return userWithoutPassword;
};

// User logout
export const logout = () => {
  removeCurrentUser();
};

// Export all necessary functions
export default {
  registerUser,
  loginUser,
  logout,
  getCurrentUser,
  isAuthenticated
};
