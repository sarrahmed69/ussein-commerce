"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OtpInput from "../components/OtpInput";
import AuthLayout from "../layout/AuthLayout";
import { useRouter } from "next-nprogress-bar";
import { useConfirmOtp } from "@/features/auth/confirm-otp";
import { useResendOtp } from "@/features/auth/resend-otp";
import { createClient } from "@/lib/supabase/client";

interface OtpFormData {
  otp: string;
}

const OtpForm: React.FC = () => {
  const confirmOTP = useConfirmOtp();
  const resendOTP = useResendOtp();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email);
    });
  }, []);

  const onOtpSubmit = async (data: OtpFormData) => {
    const id = toast.loading("Verification en cours...");
    try {
      const response = await confirmOTP.mutateAsync(data.otp);
      if (response?.success) {
        toast.success("Compte verifie avec succes !");
        router.push("/user/dashboard");
      } else {
        toast.error(response?.message || "Code invalide. Veuillez reessayer.");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      toast.done(id);
    }
  };

  const onOtpResend = async () => {
    const id = toast.loading("Renvoi du code...");
    try {
      const response = await resendOTP.mutateAsync();
      if (response?.success) {
        toast.success(response.message || "Code renvoye avec succes !");
      } else {
        toast.error(response?.message || "Echec du renvoi. Veuillez reessayer.");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      toast.done(id);
    }
  };

  const FormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otpValues = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("otp-"))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)
      .join("");
    if (otpValues.length < 6) {
      return toast.error("Code invalide. Veuillez reessayer.");
    }
    onOtpSubmit({ otp: otpValues });
  };

  return (
    <AuthLayout title="Verifier le compte" subtitle="Entrez le code OTP envoye a votre adresse e-mail">
      <form className="max-w-96 w-full mt-4" onSubmit={FormSubmission}>
        <OtpInput onOtpSubmit={(otp: string) => onOtpSubmit({ otp })} length={6} />
        <div className="text-xs text-center mt-4">
          <span suppressHydrationWarning>Entrez le code a 6 chiffres envoye a {userEmail}</span>
        </div>
        <div className="flex flex-col justify-center items-center mt-4">
          <button disabled={resendOTP.isPending || confirmOTP.isPending} type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors">
            Verifier
          </button>
          <div className="flex items-center justify-center gap-x-4 text-sm mt-4">
            <span>Vous n&apos;avez pas recu le code ? </span>
            <button onClick={() => onOtpResend()} disabled={resendOTP.isPending || confirmOTP.isPending}
              type="button" className="text-primary font-medium underline">
              Renvoyer
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default OtpForm;