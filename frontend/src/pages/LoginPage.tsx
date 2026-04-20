import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErrorBanner } from "../components/feedback/PageStates";
import { setAccessToken } from "../lib/authToken";
import { submitLogin } from "../services/auth";

type LoginFields = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFields, string>>;

function validateLogin(fields: LoginFields): LoginErrors {
  const errors: LoginErrors = {};

  if (!fields.email.trim()) {
    errors.email = "Email este obligatoriu.";
  } else if (!fields.email.includes("@")) {
    errors.email = "Email invalid.";
  }

  if (!fields.password) {
    errors.password = "Parola este obligatorie.";
  } else if (fields.password.length < 8) {
    errors.password = "Parola trebuie sa aiba minim 8 caractere.";
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered,
  );
  const [fields, setFields] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(fields);
    setErrors(nextErrors);
    setStatusMessage("");
    setApiError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await submitLogin(fields);
      setAccessToken(token.access_token);
      setStatusMessage("Autentificare reusita.");
      navigate("/", { replace: true });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Login esuat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="auth-form"
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <h2>Login</h2>

      {registered && (
        <p className="field-success">Cont creat. Autentifica-te cu email si parola.</p>
      )}

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        name="email"
        type="email"
        value={fields.email}
        onChange={(event) => setFields((prev) => ({ ...prev, email: event.target.value }))}
      />
      {errors.email && <p className="field-error">{errors.email}</p>}

      <label htmlFor="login-password">Parola</label>
      <input
        id="login-password"
        name="password"
        type="password"
        value={fields.password}
        onChange={(event) => setFields((prev) => ({ ...prev, password: event.target.value }))}
      />
      {errors.password && <p className="field-error">{errors.password}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Se trimite..." : "Intra in cont"}
      </button>

      {statusMessage && <p className="field-success">{statusMessage}</p>}
      {apiError && <ErrorBanner title="Autentificare esuata" message={apiError} />}
      {hasErrors && <p className="field-error">Corecteaza campurile marcate mai sus.</p>}

      <p className="auth-switch">
        Nu ai cont? <Link to="/register">Creeaza cont</Link>
      </p>
    </form>
  );
}
