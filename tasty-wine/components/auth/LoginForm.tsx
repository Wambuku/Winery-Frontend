"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginValues {
  identifier: string;
  password: string;
}

interface FieldErrors {
  identifier?: string;
  password?: string;
  form?: string;
}

function validate(values: LoginValues): FieldErrors {
  const validation: FieldErrors = {};
  if (!values.identifier.trim()) {
    validation.identifier = "Email or username is required";
  }

  if (!values.password) {
    validation.password = "Password is required";
  } else if (values.password.length < 6) {
    validation.password = "Password must be at least 6 characters";
  }

  return validation;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, status, error } = useAuth();
  const [values, setValues] = useState<LoginValues>({ identifier: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = status === "loading" || isSubmitting;

  const combinedError = useMemo(() => {
    return fieldErrors.form ?? error ?? null;
  }, [error, fieldErrors.form]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(values);
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = values.identifier.trim();
      await login({ email: identifier, username: identifier, password: values.password });
      setFieldErrors({});
      onSuccess?.();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to login";
      setFieldErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5 rounded-xl border border-red-200/70 bg-transparent p-6 shadow-lg shadow-red-900/10 backdrop-blur"
      noValidate
    >
     <div className="space-y-2">
      <label htmlFor="identifier" className="block text-sm font-semibold text-white">
        Email or Username
      </label>
      <input
        id="identifier"
        name="identifier"
        type="text"
        autoComplete="username"
        value={values.identifier}
        onChange={handleChange}
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-black shadow-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:bg-black/5"
        aria-invalid={Boolean(fieldErrors.identifier)}
        aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
        disabled={isLoading}
        required
      />
      {fieldErrors.identifier && (
        <p id="identifier-error" className="text-xs text-red-600">
          {fieldErrors.identifier}
        </p>
      )}

     </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-white">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-black shadow-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:bg-black/5"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          disabled={isLoading}
          required
        />
        {fieldErrors.password && (
          <p id="password-error" className="text-xs text-red-600">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {combinedError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {combinedError}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(185,28,28,0.9)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

     
    </form>
  );
}
