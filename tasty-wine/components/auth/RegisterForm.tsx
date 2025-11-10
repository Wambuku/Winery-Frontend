"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

type RoleOption = "customer" | "staff" | "admin";

interface RegisterFormProps {
  defaultRole?: RoleOption;
  onSuccess?: (autoSignedIn: boolean) => void;
}

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RoleOption;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  form?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: RegisterValues): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "Full name is required";
  } else if (values.name.trim().length < 2) {
    nextErrors.name = "Name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Email is required";
  } else if (!emailPattern.test(values.email.trim())) {
    nextErrors.email = "Enter a valid email address";
  }

  if (!values.password) {
    nextErrors.password = "Password is required";
  } else if (values.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters";
  } else if (!/[0-9]/.test(values.password) || !/[A-Za-z]/.test(values.password)) {
    nextErrors.password = "Use a mix of letters and numbers";
  }

  if (!values.confirmPassword) {
    nextErrors.confirmPassword = "Confirm your password";
  } else if (values.confirmPassword !== values.password) {
    nextErrors.confirmPassword = "Passwords do not match";
  }

  if (!values.role) {
    nextErrors.role = "Select a role";
  }

  return nextErrors;
}

export default function RegisterForm({
  defaultRole = "customer",
  onSuccess,
}: RegisterFormProps) {
  const { register, status, error } = useAuth();
  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoading = status === "loading" || isSubmitting;

  const combinedError = useMemo(() => {
    if (fieldErrors.form) return fieldErrors.form;
    if (error) return error;
    return null;
  }, [error, fieldErrors.form]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    const validation = validate(values);
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      setFieldErrors({});
      if (!result.autoSignedIn) {
        setSuccessMessage(
          result.message ??
            "Account created successfully. You can now sign in with your credentials."
        );
      } else if (result.message) {
        setSuccessMessage(result.message);
      }
      onSuccess?.(result.autoSignedIn);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to register";
      setFieldErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5 rounded-xl border border-yellow-200/60 bg-black/75 p-6 text-white shadow-xl shadow-red-900/10 backdrop-blur"
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-yellow-300">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          disabled={isLoading}
          required
        />
        {fieldErrors.name && (
          <p id="name-error" className="text-xs text-red-300">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-yellow-300">
          Winery email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          disabled={isLoading}
          required
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-xs text-red-300">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-semibold text-yellow-300">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          aria-invalid={Boolean(fieldErrors.role)}
          aria-describedby={fieldErrors.role ? "role-error" : undefined}
          disabled={isLoading}
        >
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
          <option value="admin">Administration</option>
        </select>
        {fieldErrors.role && (
          <p id="role-error" className="text-xs text-red-300">
            {fieldErrors.role}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-yellow-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            disabled={isLoading}
            required
          />
          {fieldErrors.password && (
            <p id="password-error" className="text-xs text-red-300">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-yellow-300"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
            }
            disabled={isLoading}
            required
          />
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-xs text-red-300">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {combinedError && (
        <div className="rounded-lg border border-red-400/70 bg-red-900/30 px-3 py-2 text-sm font-medium text-red-100">
          {combinedError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-300/60 bg-green-900/30 px-3 py-2 text-sm font-medium text-green-100">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_12px_24px_-12px_rgba(250,204,21,0.9)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-yellow-200"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Create account"}
      </button>

      <p className="text-xs text-white/70">
        By creating an account you agree to winery access policies. Staff and administration
        roles are monitored by HQ and require valid credentials.
      </p>
    </form>
  );
}
