import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { authService } from "../AuthService";
import "./LoginPage.css";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await authService.login(password);
    setIsLoading(false);

    if (success) {
      setPassword("");
      onLoginSuccess();
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <Container className="login-container">
        <div className="login-box">
          <h1 className="login-title">TrackTime</h1>
          <p className="login-subtitle">Time Tracking</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading || password.trim().length === 0}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Form>

          <div className="login-footer">
            <small className="text-muted">
              Enter your password to access TrackTime
            </small>
          </div>
        </div>
      </Container>
    </div>
  );
};
