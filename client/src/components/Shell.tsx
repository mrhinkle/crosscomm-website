import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { siteConfig } from "../site-config";
import { useOrigins } from "../lib/origins";
import { useReveal } from "../lib/reveal";
import { useRouteDocument } from "../lib/route-document";
import { FeedbackDialog } from "./FeedbackDialog";
import { Logo, isCurrent, primaryNav } from "./chrome";

export function Shell() {
  useRouteDocument();
  const origins = useOrigins();
  const { pathname } = useLocation();
  useReveal(pathname);
  const [menu, setMenu] = useState({ path: pathname, open: false });
  const open = menu.path === pathname && menu.open;
  const setOpen = useCallback((next: boolean | ((value: boolean) => boolean)) => {
    setMenu((current) => {
      const currentOpen = current.path === pathname && current.open;
      const value = typeof next === "function" ? next(currentOpen) : next;
      return { path: pathname, open: value };
    });
  }, [pathname]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const header = headerRef.current;
    const menu = menuRef.current;
    if (!header || !menu) return;
    const place = () => {
      const bottom = header.getBoundingClientRect().bottom;
      menu.style.setProperty("--nav-top", `${bottom}px`);
      menu.dataset.placed = "true";
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
      menu.style.removeProperty("--nav-top");
      delete menu.dataset.placed;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    menu?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
        return;
      }
      if (event.key !== "Tab" || !menu || !toggle) return;
      const nodes = [toggle, ...menu.querySelectorAll<HTMLElement>("a")];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {origins.indexable ? null : (
        <p className="review-banner">
          CrossComm website preview
        </p>
      )}
      <header ref={headerRef} className="site-header">
        <div className="wrap header-inner">
          <Logo />
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
          <nav className="nav-desktop" aria-label="Primary">
            {primaryNav.map((item) => (
              <Link key={item.href} to={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
            <Link className="talk" to="/contact/" aria-current={isCurrent(pathname, "/contact/") ? "page" : undefined}>
              Let&apos;s talk
            </Link>
          </nav>
          <nav ref={menuRef} id="site-menu" className="nav-mobile" hidden={!open} aria-label="Primary">
            {primaryNav.map((item) => (
              <Link key={item.href} to={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
            <Link className="talk" to="/contact/" aria-current={isCurrent(pathname, "/contact/") ? "page" : undefined}>
              Let&apos;s talk
            </Link>
          </nav>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<nav class="nav-noscript" aria-label="Primary">${primaryNav
                .map((item) => `<a href="${item.href}">${item.label}</a>`)
                .join("")}<a class="talk" href="/contact/">Let's talk</a></nav>`,
            }}
          />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <Logo />
            <p className="tagline">{siteConfig.tagline}</p>
            <p className="footer-meta">
              {siteConfig.offices.map((office) => `${office.city}, ${office.region}`).join(" · ")}
              <br />
              Founded {siteConfig.founded} by {siteConfig.founder}
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="plain-list">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/contact/">Contact</Link>
              </li>
              <li>
                <Link to="/careers/">Careers</Link>
              </li>
            </ul>
          </nav>
          <div>
            <ul className="plain-list">
              <li>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phoneTel}`}>{siteConfig.phoneDisplay}</a>
              </li>
            </ul>
            <FeedbackDialog />
          </div>
        </div>
      </footer>
    </>
  );
}
