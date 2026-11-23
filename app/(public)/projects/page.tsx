import type { Metadata } from "next";
import { listProjects } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { Nothing, PageHeading, Section } from "@/features/public/components/bits";
import { ProjectCard } from "@/features/public/components/cards";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "Projects", path: "/projects" });
}

export default async function ProjectsPage() {
  const projects = await listProjects();
  const order: ProjectStatus[] = ["in_progress", "planned", "completed", "on_hold"];
  const groups = order.map((s) => ({ s, list: projects.filter((p) => p.project_status === s) })).filter((g) => g.list.length);
  return (
    <>
      <PageHeading title="Projects" intro="Projects across the VECTIS businesses." />
      {groups.length ? (
        groups.map((g, n) => (
          <Section key={g.s} title={PROJECT_STATUS_LABEL[g.s]} tone={n % 2 ? "white" : "plain"}>
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {g.list.map((p) => (
                <li key={p.id} className="reveal">
                  <ProjectCard p={p} />
                </li>
              ))}
            </ul>
          </Section>
        ))
      ) : (
        <Section>
          <Nothing>Projects will appear here soon.</Nothing>
        </Section>
      )}
    </>
  );
}
