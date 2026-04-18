import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { submitRegister } from "../services/auth";

type RegisterFields = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFields, string>>;

function validateRegister(fields: RegisterFields): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!fields.fullName.trim()) {
    errors.fullName = "Numele complet este obligatoriu.";
  }

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

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Confirmarea parolei este obligatorie.";
  } else if (fields.confirmPassword !== fields.password) {
    errors.confirmPassword = "Parolele nu coincid.";
  }

  return errors;
}

export function RegisterPage() {
  const [fields, setFields] = useState<RegisterFields>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegister(fields);
    setErrors(nextErrors);
    setStatusMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await submitRegister({
        fullName: fields.fullName,
        email: fields.email,
        password: fields.password,
      });
      setStatusMessage("Formular trimis. Conectarea la backend va fi activata in pasul urmator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <h2>Register</h2>

      <label htmlFor="register-name">Nume complet</label>
      <input
        id="register-name"
        name="fullName"
        type="text"
        value={fields.fullName}
        onChange={(event) => setFields((prev) => ({ ...prev, fullName: event.target.value }))}
      />
      {errors.fullName && <p className="field-error">{errors.fullName}</p>}

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        name="email"
        type="email"
        value={fields.email}
        onChange={(event) => setFields((prev) => ({ ...prev, email: event.target.value }))}
      />
      {errors.email && <p className="field-error">{errors.email}</p>}

      <label htmlFor="register-password">Parola</label>
      <input
        id="register-password"
        name="password"
        type="password"
        value={fields.password}
        onChange={(event) => setFields((prev) => ({ ...prev, password: event.target.value }))}
      />
      {errors.password && <p className="field-error">{errors.password}</p>}

      <label htmlFor="register-confirm-password">Confirma parola</label>
      <input
        id="register-confirm-password"
        name="confirmPassword"
        type="password"
        value={fields.confirmPassword}
        onChange={(event) =>
          setFields((prev) => ({ ...prev, confirmPassword: event.target.value }))
        }
      />
      {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Se trimite..." : "Creeaza cont"}
      </button>

      {statusMessage && <p className="field-success">{statusMessage}</p>}
      {hasErrors && <p className="field-error">Corecteaza campurile marcate mai sus.</p>}

      <p className="auth-switch">
        Ai deja cont? <Link to="/login">Mergi la login</Link>
      </p>
    </form>
  );
}
