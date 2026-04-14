"use client";
import AuthInput from "../components/AuthInput";
import { HiAtSymbol } from "react-icons/hi";
import { BiLock } from "react-icons/bi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AuthLayout from "../layout/AuthLayout";
import { useSignInUser } from "@/features/auth/sign-in-user";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import SignInWithGoogle from "../components/SignInWithGoogle";
import { createClient } from "@/lib/supabase/client";

const signInSchema = z.object({
  email: z.string().email("Format d'e-mail invalide").nonempty("L'e-mail est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres").nonempty("Le mot de passe est requis"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const signInUser = useSignInUser();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    const id = toast.loading("Connexion en cours...");
    try {
      const response = await signInUser.mutateAsync(data);
      if (response?.success) {
        toast.success("Connexion reussie ! Bienvenue sur USSEIN Commerce.");

        // Verifier si vendeur directement via Supabase (plus fiable que fetch)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: vendors } = await supabase
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);
          if (vendors && vendors.length > 0) {
            router.push("/vendor/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        } else {
          router.push("/user/dashboard");
        }
      } else {
        toast.error(response?.message || "Echec de la connexion. Veuillez reessayer.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue. Veuillez reessayer."
      );
    } finally {
      toast.done(id);
    }
  };

  return (
    <AuthLayout title="Connexion" subtitle="Entrez vos identifiants pour acceder a votre compte USSEIN Commerce">
      <form className="max-w-96 w-full mt-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput type="email" label="Adresse e-mail *" icon={<HiAtSymbol />} {...register("email")} />
        {errors.email && <div className="text-red-600 font-semibold text-sm mt-2">{errors.email.message}</div>}

        <AuthInput type="password" label="Mot de passe *" icon={<BiLock />} {...register("password")} />
        {errors.password && <div className="text-red-600 font-semibold text-sm mt-2">{errors.password.message}</div>}

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary accent-primary" />
            <span className="text-xs text-gray-500">Se souvenir de moi</span>
          </label>
          <Link href="/auth/forget-password" className="text-xs text-primary hover:underline">
            Mot de passe oublie ?
          </Link>
        </div>

        <div className="flex flex-col justify-center items-center mt-6 gap-3">
          <button
            type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors"
            disabled={isSubmitting || signInUser.isPending}
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Se connecter"
            )}
          </button>

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <SignInWithGoogle />

          <p className="mt-4 text-xs text-center text-gray-700">
            Pas encore de compte ?
            <Link href="/auth/sign-up" className="font-semibold ml-2 text-primary">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignIn;