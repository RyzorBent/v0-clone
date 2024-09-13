import {
  useNavigate,
  useRevalidator,
  useRouteLoaderData,
} from "@remix-run/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { APIClient } from "./client";

export const useApiConfig = () => {
  return useRouteLoaderData("root") as {
    api: {
      url: string;
      token: string;
    };
    realtime: {
      endpoint: string;
      authorizer: string;
      namespace: string;
    };
  };
};

export const useApiClient = () => {
  const { api } = useApiConfig();
  return useMemo(() => new APIClient(api.url, api.token), [api.url, api.token]);
};

export const useChats = () => {
  const api = useApiClient();

  const { data } = useQuery(api.query("/chats"));

  return data ?? [];
};

export const useChat = (id: string) => {
  const api = useApiClient();

  const { data } = useQuery(api.query("/chats/:id", { params: { id } }));

  return data;
};

export const useCreateChat = () => {
  const api = useApiClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.post("/chats");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/chats"] });
      navigate(`/chat/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteChat = () => {
  const api = useApiClient();
  const revalidator = useRevalidator();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete("/chats/:id", { params: { id } });
    },
    onSuccess: () => {
      revalidator.revalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useSendMessage = () => {
  const api = useApiClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await api.post("/chats/:id/messages", {
        params: { id },
        body: { content },
      });
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
