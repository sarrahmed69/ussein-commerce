"use client";
import { createClient } from "@/lib/supabase/client";
import { FcGoogle } from "react-icons/fc";

const SignInWithGoogle = () => {
  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full h-11 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-colors shadow-sm"
    >
      <FcGoogle size={20} />
      Continuer avec Google
    </button>
  );
};

export default SignInWithGoogle;