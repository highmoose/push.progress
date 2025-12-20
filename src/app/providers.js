"use client";

import { HeroUIProvider } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";

export function Providers({ children }) {
  return (
    <I18nProvider locale="en-GB">
      <HeroUIProvider>{children}</HeroUIProvider>
    </I18nProvider>
  );
}
