import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import style from "../styles/pages/login.module.css";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className={style.page}>
        <section className={style.formPanel}>
          <div className={style.form}>Provera sesije...</div>
        </section>
      </div>
    );
  }

  const redirectPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "object" &&
    location.state.from !== null &&
    "pathname" in location.state.from &&
    typeof location.state.from.pathname === "string"
      ? location.state.from.pathname
      : "/dashboard";

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitError(null);
      await login(values);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Login failed. Please try again.");
    }
  });

  return (
    <div className={style.page}>
      <div className={style.backdrop} />
      <section className={style.heroPanel}>
        <p className={style.eyebrow}>IRMA Frontend</p>
        <h1>Prijava osoblja</h1>
        <p className={style.copy}>
          Forma je spremna za backend login endpoint, čuva access token i automatski ga šalje u Authorization header za naredne API pozive.
        </p>
        <div className={style.metaCard}>
          <span>Endpoint</span>
          <strong>POST /api/auth/login</strong>
        </div>
      </section>

      <section className={style.formPanel}>
        <form className={style.form} onSubmit={onSubmit} noValidate>
          <div className={style.formHeader}>
            <h2>Login</h2>
            <p>Unesite korisničko ime i lozinku za pristup aplikaciji.</p>
          </div>

          <label className={style.field}>
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="npr. admin"
              {...register("username")}
            />
            {errors.username && <small>{errors.username.message}</small>}
          </label>

          <label className={style.field}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Unesite lozinku"
              {...register("password")}
            />
            {errors.password && <small>{errors.password.message}</small>}
          </label>

          {submitError && <div className={style.errorBox}>{submitError}</div>}

          <button className={style.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Login;