import type { CSSProperties } from "react";
import { Link } from "react-router";
import { projects } from "../content/projects";
import { services } from "../content/services";
import { approachBeliefs, homeFaqs } from "../content/studio";
import { AgentRun } from "../components/AgentRun";
import { Arrow, ContactBand, FaqList, ProjectCard } from "../components/chrome";

export function HomePage() {
  return (
    <>
      <section className="hero-band band-forest">
        <div className="wrap hero">
          <p className="eyebrow eyebrow-on-dark">Durham, North Carolina · Cleveland, Ohio</p>
          <h1 className="display" tabIndex={-1}>
            <span className="line">Make the next thing.</span>
            <span className="line line-matter">Make it matter.</span>
          </h1>
          <div className="hero-body">
            <div className="hero-copy">
              <p className="deck">
                AI strategy, custom apps, and human-centered product development for ambitious teams.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-deep" to="/services/">
                  See the services
                </Link>
                <Link className="btn btn-ghost" to="/portfolio/">
                  See the work
                </Link>
              </div>
            </div>
            <AgentRun />
          </div>
        </div>
      </section>

      <section className="proof" aria-label="Studio">
        <dl className="wrap proof-grid">
          <div>
            <dt>Since</dt>
            <dd>1998</dd>
          </div>
          <div>
            <dt>Founder</dt>
            <dd>Don Shin</dd>
          </div>
          <div>
            <dt>Offices</dt>
            <dd>Durham &amp; Cleveland</dd>
          </div>
          <div>
            <dt>Practices</dt>
            <dd>{services.length}</dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Services</p>
            <h2>Five ways we can help.</h2>
          </div>
          <ol className="service-rows">
            {services.map((service, index) => (
              <li key={service.slug} data-reveal style={{ "--i": index } as CSSProperties}>
                <Link to={`/services/${service.slug}/`}>
                  <span className="num">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="row-title">{service.name}</h3>
                  <span className="row-copy">{service.description}</span>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Work</p>
            <h2>Products built for the people who use them.</h2>
            <p className="section-deck">
              A cancer-support app, a well-water test, and a museum exhibition you open in the browser.
            </p>
          </div>
          <div className="home-work" data-reveal>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <p className="section-more">
            <Link to="/portfolio/">
              All the work <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <section className="band band-mist">
        <div className="wrap people" data-reveal>
          <div>
            <p className="eyebrow">Approach</p>
            <h2>Good technology starts with people.</h2>
            <p>
              We plan the work, explain the technology, and change the plan when the work teaches us something. If the
              person who has to use it will not, it is not finished.
            </p>
            <Link className="text-link" to="/approach/">
              How a project runs <Arrow />
            </Link>
          </div>
          <ol className="belief-list">
            {approachBeliefs.slice(0, 3).map((belief) => (
              <li key={belief}>{belief}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section home-faqs">
        <div className="wrap">
          <FaqList items={homeFaqs} />
        </div>
      </section>

      <ContactBand heading="Tell us what you want to make." />
    </>
  );
}
