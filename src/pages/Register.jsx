import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/contexts/LanguageContext";
import { isValidTelegramUsername, normalizeTelegramUsername } from "@/lib/telegramNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Send, Inbox } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

const RESEND_COOLDOWN_S = 30;

// Map raw SDK/backend failures to short, friendly bilingual messages.
const FRIENDLY_ERRORS = [
  { re: /already|exists|registered/, en: 'This email is already registered — try logging in.', ar: 'هذا البريد مسجل بالفعل — جرّب تسجيل الدخول.' },
  { re: /password.*(short|weak|least)/, en: 'Password is too weak — use at least 8 characters.', ar: 'كلمة المرور ضعيفة — استخدم 8 أحرف على الأقل.' },
  { re: /invalid.*(code|otp)|expired/, en: 'That code is invalid or expired — request a new one.', ar: 'الرمز غير صحيح أو منتهي الصلاحية — اطلب رمزًا جديدًا.' },
  { re: /network|fetch|timeout/, en: 'Connection problem — check your internet and try again.', ar: 'مشكلة في الاتصال — تحقق من الإنترنت وحاول مجددًا.' },
];

function friendlyError(err, lang, fallbackEn, fallbackAr) {
  const raw = (err?.message || '').toLowerCase();
  for (const entry of FRIENDLY_ERRORS) {
    if (entry.re.test(raw)) return lang === 'ar' ? entry.ar : entry.en;
  }
  return err?.message || (lang === 'ar' ? fallbackAr : fallbackEn);
}

export default function Register() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telegram, setTelegram] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (telegram && !isValidTelegramUsername(telegram)) {
      setError(ar
        ? 'اسم مستخدم تيليجرام غير صالح — مثال: @username'
        : 'Invalid Telegram username — e.g. @username');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(friendlyError(err, lang, 'Registration failed', 'فشل إنشاء الحساب'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      // Per the Base44 SDK's documented registration flow, verifyOtp only
      // verifies the email; the authenticated session is established by a
      // subsequent login. If verifyOtp already returned a token, use it;
      // otherwise complete the flow with an explicit login so the new user
      // actually ends up signed in. Unverified users never get a token, so
      // the dashboard stays blocked until this step succeeds.
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
      }
      // Best-effort: store the optional Telegram handle on the profile. A
      // failure here must not block a successful signup.
      if (telegram) {
        try {
          await base44.auth.updateMe({ telegram_username: normalizeTelegramUsername(telegram) });
        } catch {
          /* saved later from Settings → Notifications */
        }
      }
      window.location.href = "/";
    } catch (err) {
      setError(friendlyError(err, lang, 'Invalid verification code', 'رمز التحقق غير صحيح'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      await base44.auth.resendOtp(email);
      setCooldown(RESEND_COOLDOWN_S);
      toast({
        title: ar ? 'تم إرسال الرمز' : 'Code sent',
        description: ar ? 'تحقق من بريدك الإلكتروني.' : 'Check your email for the new code.',
      });
    } catch (err) {
      setError(friendlyError(err, lang, 'Failed to resend code', 'تعذر إعادة إرسال الرمز'));
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Inbox}
        title={ar ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
        subtitle={ar ? `أرسلنا رمز تحقق إلى ${email}` : `We sent a verification code to ${email}`}
      >
        <p className="text-center text-xs text-muted-foreground mb-6">
          {ar
            ? 'يجب تأكيد بريدك قبل الدخول إلى لوحة التحكم. إن لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوبة.'
            : "You need to verify your email before accessing the dashboard. If you can't find the message, check your spam folder."}
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6" dir="ltr">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {ar ? 'جارٍ التحقق…' : 'Verifying...'}
            </>
          ) : (
            ar ? 'تأكيد' : 'Verify'
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {ar ? 'لم يصلك الرمز؟' : "Didn't receive the code?"}{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline nums"
          >
            {cooldown > 0
              ? (ar ? `إعادة الإرسال بعد ${cooldown} ث` : `Resend in ${cooldown}s`)
              : (ar ? 'إعادة الإرسال' : 'Resend')}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title={ar ? 'أنشئ حسابك' : 'Create your account'}
      subtitle={ar ? 'سجّل للبدء' : 'Sign up to get started'}
      footer={
        <>
          {ar ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {ar ? 'تسجيل الدخول' : 'Log in'}
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        {ar ? 'المتابعة عبر Google' : 'Continue with Google'}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{ar ? 'أو' : 'or'}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{ar ? 'البريد الإلكتروني' : 'Email'}</Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ps-10 h-12"
              dir="ltr"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{ar ? 'كلمة المرور' : 'Password'}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ps-10 h-12"
              dir="ltr"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{ar ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ps-10 h-12"
              dir="ltr"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="telegram">
            {ar ? 'اسم المستخدم في تيليجرام (اختياري)' : 'Telegram username (optional)'}
          </Label>
          <div className="relative">
            <Send className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="telegram"
              type="text"
              placeholder="@username"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="ps-10 h-12"
              dir="ltr"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {ar
              ? 'يُستخدم فقط للتنبيهات المهمة، مثل توصيات الأسعار الجديدة وتحديثات السوق الكبيرة.'
              : 'Used for important alerts only, such as new AI recommendations or major market updates.'}
          </p>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {ar ? 'جارٍ إنشاء الحساب…' : 'Creating account...'}
            </>
          ) : (
            ar ? 'إنشاء الحساب' : 'Create account'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
