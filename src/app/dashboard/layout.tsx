// app/dashboard/layout.tsx
"use client";

import Sidebar from "@/components/shared/sideBar";
import { ThemeToggle } from "@/components/shared/themeToggle";
import { SessionProvider } from "next-auth/react";
import React, { useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/shared/AuthGuard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <SessionProvider>
          {/* Overlay para mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 dark:bg-black/90 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 transition-transform duration-300 ease-in-out
            `}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
            {/* Header mobile */}
            <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-foreground/80 hover:bg-accent hover:text-foreground border border-border transition-all duration-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Sutura
                  </span>
                </h1>
              </div>
              <div className="w-9">
                <ThemeToggle />
              </div>
            </header>

            {/* Header desktop */}
            <header className="">
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </header>

            {/* Conteúdo */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
              <div className="max-w-7xl mx-auto w-full">
                <div className="bg-card/40 backdrop-blur-xl rounded-3xl border mt-10 border-border shadow-2xl shadow-foreground/5 relative overflow-hidden">
                  {/* Efeito de brilho sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none"></div>

                  {/* Borda luminosa sutil */}
                  <div className="absolute inset-0 rounded-3xl border border-primary/10 pointer-events-none"></div>

                  <div className="relative z-10 p-3">{children}</div>
                </div>
              </div>
            </main>
          </div>
        </SessionProvider>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
