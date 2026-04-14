import { useMutation } from "@tanstack/react-query";

type SignUpPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const useSignUpUser = () => {
  return useMutation({
    mutationFn: async (jsonData: SignUpPayload) => {
      const nameParts = jsonData.fullName.trim().split(" ");
      const firstName = nameParts[0] || jsonData.fullName;
      const lastName = nameParts.slice(1).join(" ") || "";
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: jsonData.email,
          password: jsonData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Echec inscription");
      return data;
    },
  });
};