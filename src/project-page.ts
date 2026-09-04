import "./style.css";
import { marked } from "marked";
import { loadProjects } from "./projects";
import { createShaderBackground } from "./webgl";
// import headerShader from "./shaders/header.frag?raw";
import mainShader from "./shaders/main.frag?raw";

async function loadDescription(id: string): Promise<string> {
    // get relative to the url (/projects/...)
    const response = await fetch(
        `../src/content/projects/${id}/description.md`
    );
    console.log(response);

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

    // console.log(id);

    const description_markdown = await loadDescription(id);
    // console.log(description_markdown);

    const html = await marked.parse(description_markdown);
    // console.log(html);


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

    const mainCanvas =
        document.querySelector<HTMLCanvasElement>(
            "#main-background"
        );
    if (mainCanvas) {
        createShaderBackground(
            mainCanvas,
            mainShader
        );  
    }
}