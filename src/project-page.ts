import "./style.css";
import { marked } from "marked";
import { loadProjects } from "./projects";

async function loadDescription(id: string): Promise<string> {
    const response = await fetch(
        `/content/projects/${id}/description.md`
    );

    if (!response.ok) {
        throw new Error("Could not load project description.");
    }

    return await response.text();
}

export async function renderProjectPage(id: string) {
    const projects = loadProjects();

    const project = projects.find(project => project.id === id);

    const app = document.querySelector<HTMLDivElement>("#app")!;

    if (!project) {
        app.innerHTML = `
            <main>
                <h1>Project Not Found</h1>
                <a href="/">Return Home</a>
            </main>
        `;

        return;
    }

    const markdown = await loadDescription(id);
    const html = await marked.parse(markdown);

    app.innerHTML = `
        <main class="project-page">

            <a href="/" class="back-button">
                ← Back to Projects
            </a>

            <header>
                <h1>${project.title}</h1>

                <p>
                    ${project.shortDescription}
                </p>

                <div class="project-tags">
                    ${project.technologies
                        .map(technology => `<span>${technology}</span>`)
                        .join("")}
                </div>

                <small>
                    ${project.year} · ${project.status}
                </small>
            </header>

            <article class="project-description">
                ${html}
            </article>

        </main>
    `;
}