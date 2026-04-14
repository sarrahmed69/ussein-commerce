import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { signInSchema } from "@/lib/validation/schemas";

export const useSigninUser = () => {
  return useMutation({
    mutationFn: async (jsonData: z.infer<typeof signInSchema>) => {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Echec de connexion");
      return data;
    },
  });
};

export const useSignInUser = useSigninUser;