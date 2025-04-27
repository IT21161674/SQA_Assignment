import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser } from "../services/authService";
import "./Login.css";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

function Login() {
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    console.log("clicked");
    try {
      console.log("inside try catch");
      const user = await loginUser(values.email, values.password);
      console.log("user");
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
      setLoginError("");
    } catch (error) {
      console.log("error", error);
      setLoginError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to your account</p>
        </div>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  data-testid="email-input"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  data-testid="password-input"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              {loginError && <div className="error-message">{loginError}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-button"
                data-testid="login-btn"
              >
                {isSubmitting ? "Logging in..." : "Sign In"}
              </button>

              <div className="login-footer">
                <p>
                  Don't have an account? <a id="register-page-link" href="/register">Create Acount</a>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
