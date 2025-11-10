"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginValues {
  username: string;
  password: string;
}

interface FieldErrors {
  username?: string;
  password?: string;
  form?: string;
}

function validate(values: LoginValues): FieldErrors {
  const validation: FieldErrors = {};
  if (!values.username.trim()) {
    validation.username = "Username is required";
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
  const [values, setValues] = useState<LoginValues>({ username: "", password: "" });
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
      await login({ username: values.username.trim(), password: values.password });
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
      className="w-full max-w-sm space-y-5 rounded-xl border border-red-200/70 bg-white/95 p-6 shadow-lg shadow-red-900/10 backdrop-blur"
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-black">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-black shadow-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:bg-black/5"
          aria-invalid={Boolean(fieldErrors.username)}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
          disabled={isLoading}
          required
        />
        {fieldErrors.username && (
          <p id="username-error" className="text-xs text-red-600">
            {fieldErrors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-black">
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

      <div className="rounded-lg border border-black/10 bg-black/80 px-4 py-3 text-xs text-white/90">
        <p className="font-semibold text-yellow-400">Staff &amp; Admin access</p>
        <p className="mt-1">
          Staff accounts cover daily floor operations, while administration users unlock
          inventory control and analytics. Use your winery email and password issued
          by HQ to authenticate against the secure token service.
        </p>
      </div>
    </form>
  );
}
