import { useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Form, Container, Alert, Card } from "react-bootstrap";
import ApiClient from "../../utils/ApiClient";
import { AxiosError } from "axios";

interface FormLogin {
  email: string;
  password: string;
}

interface LoginProps {
  setUser: (user: User) => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

interface ErrorResponse {
  message: string;
}

function Login({ setUser }: LoginProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormLogin>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await ApiClient.post<LoginResponse>("/auth/login", form);

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate("/home");
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2>🎌 AnimeDrop</h2>
            <p className="text-muted">Login to your account</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control value={form.email} onChange={handleInputChange} name="email" type="email" placeholder="your@email.com" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control value={form.password} onChange={handleInputChange} name="password" type="password" placeholder="••••••••" required />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p>
              Don't have an account? <NavLink to="/register">Register here</NavLink>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
