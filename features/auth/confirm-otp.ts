import { useMutation } from "@tanstack/react-query";

export const useConfirmOtp = () => {
  return useMutation({
    mutationFn: async (otp: string) => {
      const response = await fetch("/api/auth/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP invalide");
      return data;
    },
  });
};