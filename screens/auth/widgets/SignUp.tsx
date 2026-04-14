"use client";
import AuthInput from "../components/AuthInput";
import { HiAtSymbol } from "react-icons/hi";
import { BiLock, BiUser } from "react-icons/bi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AuthLayout from "../layout/AuthLayout";
import { useSignUpUser } from "@/features/auth/sign-up-user";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import SignInWithGoogle from "../components/SignInWithGoogle";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").nonempty("Le nom est requis"),
    email: z.string().email("Format d'e-mail invalide").nonempty("L'e-mail est requis"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").nonempty("Le mot de passe est requis"),
    confirmPassword: z.string().nonempty("Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const signUpUser = useSignUpUser();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    const id = toast.loading("Création du compte...");
    try {
      const response = await signUpUser.mutateAsync(data);
      if (response?.success) {
        reset();
        toast.success("Compte créé avec succès ! Bienvenue sur USSEIN Commerce.");
        router.push("/auth/confirm-otp");
      } else {
        toast.error(response?.message || "Échec de l'inscription. Veuillez réessayer.");
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
    <AuthLayout title="Créer un compte" subtitle="Rejoignez USSEIN Commerce et achetez ou vendez sur le campus">
      <form className="max-w-96 w-full mt-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput type="text" label="Nom complet *" icon={<BiUser />} {...register("fullName")} />
        {errors.fullName && <div className="text-red-600 font-semibold text-sm mt-2">{errors.fullName.message}</div>}

        <AuthInput type="email" label="Adresse e-mail *" icon={<HiAtSymbol />} {...register("email")} />
        {errors.email && <div className="text-red-600 font-semibold text-sm mt-2">{errors.email.message}</div>}

        <AuthInput type="password" label="Mot de passe *" icon={<BiLock />} {...register("password")} />
        {errors.password && <div className="text-red-600 font-semibold text-sm mt-2">{errors.password.message}</div>}

        <AuthInput type="password" label="Confirmer le mot de passe *" icon={<BiLock />} {...register("confirmPassword")} />
        {errors.confirmPassword && <div className="text-red-600 font-semibold text-sm mt-2">{errors.confirmPassword.message}</div>}

        <div className="flex flex-col justify-center items-center mt-6 gap-3">
          <button
            type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors"
            disabled={isSubmitting || signUpUser.isPending}
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Créer mon compte"
            )}
          </button>

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <SignInWithGoogle />

          <p className="mt-4 text-xs text-center text-gray-700">
            Déjà un compte ?
            <Link href="/auth/sign-in" className="font-semibold ml-2 text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
