import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
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
  const [fields, setFields] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(fields);
    setErrors(nextErrors);
    setStatusMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await submitLogin(fields);
      setStatusMessage("Formular trimis. Conectarea la backend va fi activata in pasul urmator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <h2>Login</h2>

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
      {hasErrors && <p className="field-error">Corecteaza campurile marcate mai sus.</p>}

      <p className="auth-switch">
        Nu ai cont? <Link to="/register">Creeaza cont</Link>
      </p>
    </form>
  );
}
