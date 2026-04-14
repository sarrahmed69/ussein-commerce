"use client";
import AuthInput from "../components/AuthInput";
import { HiAtSymbol } from "react-icons/hi";
import { BiLock } from "react-icons/bi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AuthLayout from "../layout/AuthLayout";
import { useSetNewPassword } from "@/features/auth/set-new-password";
import { toast } from "react-toastify";
import Link from "next/link";

const NewPasswordSchema = z
  .object({
    email: z.string().email("Format d'e-mail invalide").nonempty("L'e-mail est requis"),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").nonempty("Le nouveau mot de passe est requis"),
    confirmPassword: z.string().nonempty("Veuillez confirmer votre nouveau mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type NewPasswordFormData = z.infer<typeof NewPasswordSchema>;

const NewPassword = () => {
  const setNewPassword = useSetNewPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(NewPasswordSchema),
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    const id = toast.loading("Réinitialisation en cours...");
    try {
      const response = await setNewPassword.mutateAsync(data);
      if (response?.success) {
        reset();
        toast.success(response.message || "Mot de passe réinitialisé avec succès.");
      } else {
        toast.error(response?.message || "Échec de la réinitialisation. Veuillez réessayer.");
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
    <AuthLayout title="Nouveau mot de passe" subtitle="Entrez votre e-mail et votre nouveau mot de passe">
      <form className="max-w-96 w-full mt-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput type="email" label="Adresse e-mail *" icon={<HiAtSymbol />} {...register("email")} />
        {errors.email && <div className="text-red-600 font-semibold text-sm mt-2">{errors.email.message}</div>}

        <AuthInput type="password" label="Nouveau mot de passe *" icon={<BiLock />} {...register("newPassword")} />
        {errors.newPassword && <div className="text-red-600 font-semibold text-sm mt-2">{errors.newPassword.message}</div>}

        <AuthInput type="password" label="Confirmer le mot de passe *" icon={<BiLock />} {...register("confirmPassword")} />
        {errors.confirmPassword && <div className="text-red-600 font-semibold text-sm mt-2">{errors.confirmPassword.message}</div>}

        <div className="flex justify-center items-center mt-8">
          <button
            type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Enregistrer le mot de passe"
            )}
          </button>
        </div>
        <p className="mt-8 text-xs text-center text-gray-700">
          Se connecter à votre compte
          <Link href="/auth/sign-in" className="font-semibold ml-2 text-primary">
            Connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default NewPassword;
