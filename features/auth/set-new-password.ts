import { useMutation } from "@tanstack/react-query";

export const useSetNewPassword = () => {
  return useMutation({
    mutationFn: async (payload: { email: string; newPassword: string }) => {
      const response = await fetch("/api/auth/new-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur");
      return data;
    },
  });
};