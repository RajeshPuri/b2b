"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const demoAccounts = [
  { label: "Wholesaler", email: "wholesaler@b2b.com", password: "wholesale123" },
  { label: "Client", email: "client@b2b.com", password: "client123" },
  { label: "Admin", email: "admin@b2b.com", password: "admin123" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Invalid email or password. Try one of the demo accounts below.");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const user = session?.user as
      | { businessType?: string | null; role?: string }
      | undefined;

    const destination =
      user?.businessType === "CLIENT" ? "/dashboard/client" : "/dashboard/wholesaler";

    router.push(destination);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@business.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="quick-fill">
        <span>Quick fill demo:</span>
        {demoAccounts.map((account) => (
          <button
            type="button"
            key={account.label}
            className="quick-fill-chip"
            onClick={() => {
              setEmail(account.email);
              setPassword(account.password);
              setError(null);
            }}
          >
            {account.label}
          </button>
        ))}
      </div>
    </form>
  );
}
