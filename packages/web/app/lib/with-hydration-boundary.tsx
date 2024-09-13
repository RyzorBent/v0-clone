import { useLoaderData } from "@remix-run/react";
import { HydrationBoundary } from "@tanstack/react-query";

export const withHydrationBoundary = (Component: React.ComponentType) => {
  return function WithHydrationBoundary(
    props: React.ComponentProps<typeof Component>,
  ) {
    const { dehydratedState } = useLoaderData<{ dehydratedState: string }>();

    return (
      <HydrationBoundary state={dehydratedState}>
        <Component {...props} />
      </HydrationBoundary>
    );
  };
};
