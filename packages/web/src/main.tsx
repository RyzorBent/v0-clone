import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { Toaster } from "~/components/ui/sonner";
import { store } from "~/lib/store";
import { router } from "~/router";

import "./tailwind.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </ClerkProvider>
  </StrictMode>,
);
