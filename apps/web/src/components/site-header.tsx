"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AUTH_SESSION_UPDATED_EVENT,
  loadActiveAuthSession,
  type AuthSession
} from "@/lib/auth-session";
import { hasAnyBackofficeAccess, ROLE_LABELS } from "@/lib/access-control";
import { utilityLinks } from "@/lib/public-content";
import { buildMainNavigation } from "@/lib/site-navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function syncAuthSession() {
      setAuthSession(loadActiveAuthSession());
    }

    syncAuthSession();
    window.addEventListener("storage", syncAuthSession);
    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, syncAuthSession);

    return () => {
      window.removeEventListener("storage", syncAuthSession);
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, syncAuthSession);
    };
  }, [pathname]);

  const accountDisplayName = authSession?.user.displayName ?? null;
  const primaryRole = authSession?.user.roles[0] ?? null;
  const primaryRoleLabel =
    primaryRole && primaryRole in ROLE_LABELS
      ? ROLE_LABELS[primaryRole as keyof typeof ROLE_LABELS]
      : null;
  const roles = authSession?.user.roles ?? [];
  const navigationLinks = buildMainNavigation(roles);
  const canOpenBackoffice = hasAnyBackofficeAccess(roles);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-row">
          <div className="topbar-badges">
            {primaryRoleLabel ? <span className="pill">{primaryRoleLabel}</span> : null}
            <span className="pill">Tiếng Việt</span>
            <span className="pill">
              Đặt vé nội địa, quản lý hành trình và làm thủ tục trực tuyến thuận tiện
            </span>
          </div>
          <nav className="utility-nav" aria-label="Tiện ích nhanh">
            {utilityLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="container nav-row">
        <div className="nav-row-primary">
          <Link href="/" className="brand">
            <span className="brand-logo">
              <Image
                src="/images/logo-vietnamairlines.jpg"
                alt="Logo Vietnam Airlines"
                width={1086}
                height={159}
                sizes="(max-width: 640px) 248px, 360px"
                unoptimized
                priority
              />
            </span>
          </Link>
          <div className="nav-row-actions">
            <div className="nav-meta">
              <span>Trung tâm hỗ trợ</span>
              <strong>1900 6868</strong>
            </div>
            {accountDisplayName ? (
              <Link
                href="/account"
                className="button button-secondary nav-action-button"
              >
                {accountDisplayName}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="button button-secondary nav-action-button"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="button button-secondary nav-action-button"
                >
                  Tạo tài khoản
                </Link>
              </>
            )}
            {canOpenBackoffice ? (
              <Link
                href="/backoffice"
                className="button button-secondary nav-action-button"
              >
                Backoffice
              </Link>
            ) : null}
            <Link
              href="/search"
              className="button button-primary nav-action-button"
            >
              Đặt vé
            </Link>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setIsMobileOpen((value) => !value)}
              aria-expanded={isMobileOpen}
              aria-label="Mở menu điều hướng"
            >
              {isMobileOpen ? "Đóng" : "Menu"}
            </button>
          </div>
        </div>
        <div className={isMobileOpen ? "nav-cluster mobile-open" : "nav-cluster"}>
          <nav className="main-nav" aria-label="Điều hướng chính">
            {navigationLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "nav-link active" : "nav-link"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="nav-actions-wrap">
            <nav className="mobile-utility-nav" aria-label="Tiện ích nhanh trên di động">
              {utilityLinks.map((link) => (
                <Link key={link.href} href={link.href} className="mobile-utility-link">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="nav-actions">
              <div className="nav-meta nav-meta-mobile">
                <span>Trung tâm hỗ trợ</span>
                <strong>1900 6868</strong>
              </div>
              {accountDisplayName ? (
                <Link href="/account" className="button button-secondary">
                  {accountDisplayName}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="button button-secondary">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="button button-secondary">
                    Tạo tài khoản
                  </Link>
                </>
              )}
              {canOpenBackoffice ? (
                <Link href="/backoffice" className="button button-secondary">
                  Backoffice
                </Link>
              ) : null}
              <Link href="/search" className="button button-primary">
                Đặt vé
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
