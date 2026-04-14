import { useMutation } from "@tanstack/react-query";

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur");
      return data;
    },
  });
};