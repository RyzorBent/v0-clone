import type { SerializeFrom } from "@remix-run/node";

import type { schema } from "@project-4/core/db";

export interface RouteManifest {
  "/chats": {
    get: {
      response: SerializeFrom<schema.Chat[]>;
    };
    post: {
      body?: { title: string };
      response: SerializeFrom<schema.Chat>;
    };
  };
  "/chats/:id": {
    get: {
      params: { id: string };
      response: SerializeFrom<schema.Chat & { messages: schema.Message[] }>;
    };
    delete: {
      params: { id: string };
      response: SerializeFrom<void>;
    };
  };
  "/chats/:id/messages": {
    post: {
      params: { id: string };
      body: { content: string };
      response: SerializeFrom<schema.Message>;
    };
  };
}

type MethodPath<Method extends "get" | "post" | "delete"> = {
  [K in keyof RouteManifest]: RouteManifest[K] extends {
    [method in Method]: unknown;
  }
    ? K
    : never;
}[keyof RouteManifest];

export class APIClient {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  query<Path extends MethodPath<"get">>(
    path: Path,
    input?: Omit<RouteManifest[Path]["get"], "response">,
  ) {
    return {
      queryKey: input && "params" in input ? [path, input.params] : [path],
      queryFn: () => this.get(path, input),
    };
  }

  async get<Path extends MethodPath<"get">>(
    path: Path,
    input?: Omit<RouteManifest[Path]["get"], "response">,
  ): Promise<RouteManifest[Path]["get"]["response"]> {
    const url = this.buildPath(
      path,
      // @ts-expect-error input is optional
      input?.params ?? {},
    );
    return await this.request(url, { method: "GET" });
  }

  async post<Path extends MethodPath<"post">>(
    path: Path,
    input?: Omit<RouteManifest[Path]["post"], "response">,
  ): Promise<RouteManifest[Path]["post"]["response"]> {
    const url = this.buildPath(
      path,
      // @ts-expect-error input is optional
      input?.params,
    );
    return await this.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input?.body ?? {}),
    });
  }

  async delete<Path extends MethodPath<"delete">>(
    path: Path,
    input?: Omit<RouteManifest[Path]["delete"], "response">,
  ): Promise<RouteManifest[Path]["delete"]["response"]> {
    const url = this.buildPath(path, input?.params ?? {});
    return await this.request(url, { method: "DELETE" });
  }

  private buildPath(path: string, params?: Record<string, string>) {
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });
    }
    return path;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    console.log(`requesting ${init?.method ?? "GET"} ${this.url}${path}`);
    const res = await fetch(`${this.url}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error(res.statusText);
    }

    return await res.json();
  }
}
