import { createBrowserRouter } from "react-router-dom";

import { ChatPage } from "./routes/chat";
import { HomePage } from "./routes/home";
import { RootLayout } from "./routes/root";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: ":id",
        element: <ChatPage />,
      },
    ],
  },
]);
