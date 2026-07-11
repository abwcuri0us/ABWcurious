"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";

export type PageId =
  | "home"
  | "careers"
  | "events"
  | "solutions"
  | "partnership"
  | "sponsorship"
  | "admin"
  | "dashboard"
  | "status"
  | "service-detail";

interface PageState {
  currentPage: PageId;
  pageParams: Record<string, string>;
}

interface NavigationContextType {
  page: PageState;
  navigate: (pageId: PageId, params?: Record<string, string>) => void;
  goHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageState>({
    currentPage: "home",
    pageParams: {},
  });

  // Listen to hash changes for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        setPage({ currentPage: "home", pageParams: {} });
        return;
      }
      const [pageId, ...paramParts] = hash.split("/");
      const validPages: PageId[] = [
        "home", "careers", "events",
        "solutions", "partnership", "sponsorship", "admin", "dashboard", "status", "service-detail",
      ];
      if (validPages.includes(pageId as PageId)) {
        const params: Record<string, string> = {};
        if (pageId === "service-detail" && paramParts[0]) {
          params.slug = paramParts[0];
        }
        setPage({ currentPage: pageId as PageId, pageParams: params });
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((pageId: PageId, params: Record<string, string> = {}) => {
    let hash: string = pageId;
    if (pageId === "service-detail" && params.slug) {
      hash = `service-detail/${params.slug}`;
    }
    window.location.hash = hash;
    setPage({ currentPage: pageId, pageParams: params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    window.location.hash = "";
    setPage({ currentPage: "home", pageParams: {} });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const value = useMemo(() => ({ page, navigate, goHome }), [page, navigate, goHome]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
