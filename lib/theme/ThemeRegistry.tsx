"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import theme from "./theme";

function createEmotionCache() {
  return createCache({ key: "mui" });
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = React.useState(() => {
    const c = createEmotionCache();
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = "";
    const dataEmotionAttribute = cache.key;

    const flushed: string[] = [];
    names.forEach((name) => {
      const val = cache.inserted[name];
      if (typeof val === "string") {
        styles += val;
        flushed.push(name);
      }
    });

    // Clear inserted styles so they are not re-inserted
    flushed.forEach((name) => {
      delete cache.inserted[name];
    });

    return (
      <style
        key={dataEmotionAttribute}
        data-emotion={`${dataEmotionAttribute} ${flushed.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
