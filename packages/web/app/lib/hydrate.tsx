import { useLoaderData } from "@remix-run/react";
import { HydrationBoundary } from "@tanstack/react-query";

export function Hydrate(props: { children: React.ReactNode }) {
  const { dehydratedState } = useLoaderData<{ dehydratedState: string }>();

  return (
    <HydrationBoundary state={dehydratedState}>
      {props.children}
    </HydrationBoundary>
  );
}
