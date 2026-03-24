"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import ThemeRegistry from "@/lib/theme/ThemeRegistry";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeRegistry>{children}</ThemeRegistry>
    </Provider>
  );
}
