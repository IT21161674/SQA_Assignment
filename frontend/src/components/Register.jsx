import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { registerUser } from "../services/authService";
import "./Register.css";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

function Register() {
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      await registerUser(values.name, values.email, values.password);
      navigate("/login");
    } catch (error) {
      setRegisterError("Registration failed. Email may already be in use.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us to start shopping</p>
        </div>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  className="form-control"
                  data-testid="name-input"
                />
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  data-testid="email-input"
                />
                <ErrorMessage name="email" component="div" className="error-message" />
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
                <ErrorMessage name="password" component="div" className="error-message" />
                <div className="password-requirements">
                  <p>Password must:</p>
                  <ul>
                    <li>Be at least 6 characters long</li>
                    <li>Contain at least one number</li>
                    <li>Contain at least one special character</li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="form-control"
                  data-testid="confirm-password-input"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="error-message"
                />
              </div>

              {registerError && <div className="error-message">{registerError}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="register-button"
                data-testid="register-btn"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              <div className="register-footer">
                <p>Already have an account? <a href="/login">Sign In</a></p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
