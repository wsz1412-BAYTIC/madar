import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const nextUrl = new URLSearchParams(location.search).get("next") || "/dashboard";
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        navigate(nextUrl, { replace: true });
      } else {
        base44.auth.redirectToLogin(nextUrl);
      }
    });
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}