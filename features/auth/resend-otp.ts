import { useMutation } from "@tanstack/react-query";

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur");
      return data;
    },
  });
};