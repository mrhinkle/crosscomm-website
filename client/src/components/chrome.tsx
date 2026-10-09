import type { ReactNode } from "react";
import { Link } from "react-router";
import { categoryLabels } from "../content/projects";
import type { Faq, ProjectRecord } from "../content/types";
import { useMatchedRoute } from "../lib/route-document";
import { siteConfig } from "../site-config";

export const primaryNav = [
  { href: "/services/", label: "Services" },
  { href: "/portfolio/", label: "Work" },
  { href: "/approach/", label: "Approach" },
  { href: "/resources/blog/", label: "Insights" },
] as const;

export function isCurrent(pathname: string, href: string): boolean {
  const bare = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const target = href.replace(/\/+$/, "") || "/";
  if (target === "/") return bare === "/";
  return bare === target || bare.startsWith(`${target}/`);
}

export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="CrossComm home">
      <img src="/logo.png" width={676} height={129} alt="" />
    </Link>
  );
}

export function Breadcrumbs() {
  const route = useMatchedRoute();
  if (route.crumbs.length === 0) return null;
  const items = [{ name: "Home", path: "/" }, ...route.crumbs];
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`}>
              {last ? <span aria-current="page">{item.name}</span> : <Link to={item.path}>{item.name}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageIntro({
  eyebrow,
  title,
  deck,
  className = "",
}: {
  eyebrow: string;
  title: string;
  deck: string;
  className?: string;
}) {
  return (
    <header className={className ? `page-intro ${className}` : "page-intro"}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 tabIndex={-1}>{title}</h1>
      <p className="deck">{deck}</p>
    </header>
  );
}

export function FaqList({ items, title = "Questions" }: { items: readonly Faq[]; title?: string }) {
  return (
    <section className="faqs">
      <h2>{title}</h2>
      <div className="faq-list">
        {items.map((item) => (
          <article key={item.question} className="faq">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <article className={`project-card slug-${project.slug}`}>
      <div className="media">
        <img
          src={project.hero.src}
          width={project.hero.width}
          height={project.hero.height}
          alt={project.hero.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <ul className="tags">
        {project.categories.map((category) => (
          <li key={category}>{categoryLabels[category]}</li>
        ))}
      </ul>
      <h3>
        <Link to={`/portfolio/${project.slug}/`}>{project.name}</Link>
      </h3>
      <p>{project.summary}</p>
    </article>
  );
}

export function ContactBand({ heading, children }: { heading: string; children?: ReactNode }) {
  return (
    <section className="band band-forest">
      <div className="wrap band-inner">
        <p className="eyebrow eyebrow-on-dark">Contact</p>
        <h2>{heading}</h2>
        {children ?? (
          <p className="band-lead">
            Tell us about the team, the person who has to use the thing, and what you want to make.
          </p>
        )}
        <div className="band-actions">
          <a className="btn btn-paper" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          <a className="btn btn-ghost" href={`tel:${siteConfig.phoneTel}`}>
            {siteConfig.phoneDisplay}
          </a>
          <Link className="text-link on-dark" to="/contact/">
            Write a brief <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ContactStrip() {
  return (
    <aside className="contact-strip">
      <div className="wrap strip-inner">
        <p>Tell us what you want to make.</p>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        <Link to="/contact/">
          Contact <Arrow />
        </Link>
      </div>
    </aside>
  );
}
