"use client";
import AuthInput from "../components/AuthInput";
import { HiAtSymbol } from "react-icons/hi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AuthLayout from "../layout/AuthLayout";
import { useForgetPassword } from "@/features/auth/forget-password";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";

const forgetPasswordSchema = z.object({
  email: z.string().email("Format d'e-mail invalide").nonempty("L'e-mail est requis"),
});

type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;

const ForgetPassword = () => {
  const resetPassword = useForgetPassword();
  const router = useRouter();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordFormData>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const onSubmit = async (data: ForgetPasswordFormData) => {
    const id = toast.loading("Envoi en cours...");
    try {
      const response = await resetPassword.mutateAsync(data.email);
      if (response?.success) {
        reset();
        toast.success(response.message || "Demande envoyée avec succès.");
        router.push("/auth/new-password");
      } else {
        toast.error(response?.message || "Échec de la demande. Veuillez réessayer.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      toast.done(id);
    }
  };

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Entrez votre e-mail pour réinitialiser votre mot de passe">
      <form className="max-w-96 w-full mt-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          type="email"
          label="Adresse e-mail *"
          icon={<HiAtSymbol />}
          {...register("email")}
        />
        {errors.email && (
          <div className="text-red-600 font-semibold text-sm mt-2">
            {errors.email.message}
          </div>
        )}

        <div className="flex flex-col justify-center items-center mt-8">
          <button
            type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors"
            disabled={isSubmitting || resetPassword.isPending}
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
          <p className="mt-8 text-xs text-center text-gray-700">
            Vous avez votre mot de passe ?
            <Link href="/auth/sign-in" className="font-semibold ml-2 text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;
