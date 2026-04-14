import { useQuery } from "@tanstack/react-query";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur");
      return data;
    },
  });
};