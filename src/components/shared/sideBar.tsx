// components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Lightbulb,
  Clapperboard,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [openSubmenus, setOpenSubmenus] = useState({
    projetos: false,
  });
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState) {
      const { isCollapsed: savedCollapsed, openSubmenus: savedSubmenus } =
        JSON.parse(savedState);
      setIsCollapsed(savedCollapsed);
      setOpenSubmenus(savedSubmenus || { projetos: false });
    } else {
      setIsCollapsed(false);
    }
  }, []);

  useEffect(() => {
    if (isCollapsed !== null) {
      const stateToSave = {
        isCollapsed,
        openSubmenus,
      };
      localStorage.setItem("sidebarState", JSON.stringify(stateToSave));
    }
  }, [isCollapsed, openSubmenus]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: !prev[menu as keyof typeof prev],
    }));
  };

  const handleProjetosClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
    if (!openSubmenus.projetos) {
      setOpenSubmenus((prev) => ({
        ...prev,
        projetos: true,
      }));
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    return nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  const isProjetosActive =
    pathname === "/dashboard/projetos" ||
    pathname.includes("/dashboard/projetos/script") ||
    pathname.includes("/dashboard/projetos/thumbnail") ||
    pathname.includes("/dashboard/projetos/edicao") ||
    pathname.includes("/dashboard/projetos/descricao-seo") ||
    pathname.includes("/dashboard/projetos/publicacao");

  if (isCollapsed === null) {
    return <div className="w-20 lg:w-64"></div>;
  }

  return (
    <div
      className={`
        flex flex-col h-full bg-sidebar border-r border-border
        ${isCollapsed ? "w-20" : "w-64"} 
        transition-all duration-300
      `}
    >
      {/* Topo da Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src="https://github.com/Claudenir-Nojosa/servidor_estaticos/blob/main/BeCash-Logo.png?raw=true"
                alt="Sutura Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border border-border"
              />
              <div className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg"></div>
            </div>
            <div>
              <span className="text-xl font-light bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Sutura
              </span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-1"></div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden hover:bg-accent text-muted-foreground border border-border h-10 w-10 transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex hover:bg-accent text-muted-foreground border border-border h-10 w-10 transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {/* Página Inicial */}
          <li>
            <Link
              href="/dashboard"
              className={`
                flex items-center rounded-xl hover:bg-accent text-muted-foreground transition-all duration-300
                ${isCollapsed ? "justify-center p-4" : "p-4"}
                ${isActiveRoute("/dashboard") ? "bg-primary/10 text-foreground border-l-2 border-primary shadow-sm" : ""}
              `}
              onClick={handleLinkClick}
            >
              <Home className="h-5 w-5" />
              {!isCollapsed && (
                <span className="ml-4 text-sm font-medium">Página Inicial</span>
              )}
            </Link>
          </li>

          {/* Projetos com Submenu */}
          <li>
            <div className="space-y-1">
              {/* Link principal do menu Projetos */}
              <Link
                href="/dashboard/projetos"
                className={`
                  flex items-center w-full rounded-xl hover:bg-accent text-muted-foreground transition-all duration-300
                  ${isCollapsed ? "justify-center p-4" : "justify-between p-4"}
                  ${isProjetosActive ? "bg-primary/10 text-foreground border-l-2 border-primary shadow-sm" : ""}
                `}
                onClick={handleProjetosClick}
              >
                <div className="flex items-center">
                  <Clapperboard className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="ml-4 text-sm font-medium">Projetos</span>
                  )}
                </div>
                {!isCollapsed &&
                  (openSubmenus.projetos ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                  ))}
              </Link>

              {/* Submenu Projetos */}
              {!isCollapsed && openSubmenus.projetos && (
                <div className="ml-6 space-y-1 border-l border-border pl-3">
                  <Link
                    href="/dashboard/projetos/script"
                    className={`
                      flex items-center rounded-lg hover:bg-accent/50 text-muted-foreground transition-all duration-300 p-3
                      ${isActiveRoute("/dashboard/projetos/script") ? "bg-primary/5 text-foreground" : ""}
                    `}
                    onClick={handleLinkClick}
                  >
                    <span className="text-sm font-medium">Script</span>
                  </Link>

                  <Link
                    href="/dashboard/projetos/thumbnail"
                    className={`
                      flex items-center rounded-lg hover:bg-accent/50 text-muted-foreground transition-all duration-300 p-3
                      ${isActiveRoute("/dashboard/projetos/thumbnail") ? "bg-primary/5 text-foreground" : ""}
                    `}
                    onClick={handleLinkClick}
                  >
                    <span className="text-sm font-medium">Thumbnail</span>
                  </Link>

                  <Link
                    href="/dashboard/projetos/edicao"
                    className={`
                      flex items-center rounded-lg hover:bg-accent/50 text-muted-foreground transition-all duration-300 p-3
                      ${isActiveRoute("/dashboard/projetos/edicao") ? "bg-primary/5 text-foreground" : ""}
                    `}
                    onClick={handleLinkClick}
                  >
                    <span className="text-sm font-medium">Edição</span>
                  </Link>

                  <Link
                    href="/dashboard/projetos/descricao-seo"
                    className={`
                      flex items-center rounded-lg hover:bg-accent/50 text-muted-foreground transition-all duration-300 p-3
                      ${isActiveRoute("/dashboard/projetos/descricao-seo") ? "bg-primary/5 text-foreground" : ""}
                    `}
                    onClick={handleLinkClick}
                  >
                    <span className="text-sm font-medium">Descrição/SEO</span>
                  </Link>

                  <Link
                    href="/dashboard/projetos/publicacao"
                    className={`
                      flex items-center rounded-lg hover:bg-accent/50 text-muted-foreground transition-all duration-300 p-3
                      ${isActiveRoute("/dashboard/projetos/publicacao") ? "bg-primary/5 text-foreground" : ""}
                    `}
                    onClick={handleLinkClick}
                  >
                    <span className="text-sm font-medium">Publicação</span>
                  </Link>
                </div>
              )}
            </div>
          </li>

          {/* Calendário */}
          <li>
            <Link
              href="/dashboard/calendario"
              className={`
                flex items-center rounded-xl hover:bg-accent text-muted-foreground transition-all duration-300
                ${isCollapsed ? "justify-center p-4" : "p-4"}
                ${isActiveRoute("/dashboard/calendario") ? "bg-primary/10 text-foreground border-l-2 border-primary shadow-sm" : ""}
              `}
              onClick={handleLinkClick}
            >
              <Calendar className="h-5 w-5" />
              {!isCollapsed && (
                <span className="ml-4 text-sm font-medium">Calendário</span>
              )}
            </Link>
          </li>

          {/* Brainstorm */}
          <li>
            <Link
              href="/dashboard/brainstorm"
              className={`
                flex items-center rounded-xl hover:bg-accent text-muted-foreground transition-all duration-300
                ${isCollapsed ? "justify-center p-4" : "p-4"}
                ${isActiveRoute("/dashboard/brainstorm") ? "bg-primary/10 text-foreground border-l-2 border-primary shadow-sm" : ""}
              `}
              onClick={handleLinkClick}
            >
              <Lightbulb className="h-5 w-5" />
              {!isCollapsed && (
                <span className="ml-4 text-sm font-medium">Brainstorm</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          {/* Perfil do Usuário */}
          <div
            className={`
              flex items-center rounded-xl p-3 bg-accent/50 backdrop-blur-sm border border-border
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage
                src={session?.user?.image || ""}
                alt={session?.user?.name || "Usuário"}
              />
              <AvatarFallback className="bg-primary/10 text-foreground text-sm">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>

          {/* Botão Sair */}
          <Button
            variant="ghost"
            className={`
              w-full rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300
              border border-border
              ${isCollapsed ? "justify-center p-3" : "justify-start p-3"}
            `}
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3 text-sm">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
