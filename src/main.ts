import "./style.css";
import { loadProjects } from "./projects";
import { renderProjectPage } from "./project-page";
import { createShaderBackground } from "./webgl";
import headerShader from "./shaders/header.frag?raw";
import mainShader from "./shaders/main.frag?raw";

const thumbnailUrls = import.meta.glob(
    "/src/content/projects/*/*.{png,jpg,jpeg,webp,gif}",
    {
        eager: true,
        query: "?url",
        import: "default"
    }
) as Record<string, string>;

const path = window.location.pathname;

if (path.startsWith("/projects/")) {
    const id = path.split("/")[2];

    if (id) {
        renderProjectPage(id);
    }
} else {
    renderHomePage();
}

const headerCanvas =
    document.querySelector<HTMLCanvasElement>(
        "#header-background"
    );
if (headerCanvas) {
    createShaderBackground(
        headerCanvas,
        headerShader
    );
}

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

function renderHomePage() {
    const projects = loadProjects();

    const app = document.querySelector<HTMLDivElement>("#app")!;

    app.innerHTML = `
        <header class="hero">
            <h1>Jack Caesar</h1>
            <p>Computer Science Student & Game Programmer</p>
        </header>

        <main>
            <section>
                <h2 class="projects-header">Projects</h2>
                <div id="projects" class="projects-grid"></div>
            </section>
        </main>
    `;

    const projectsContainer =
        document.querySelector<HTMLDivElement>("#projects")!;

    for (const project of projects) {
        const card = document.createElement("a");

        const thumbnailPath = project.thumbnail
            ? `/src/content/projects/${project.id}/${project.thumbnail.replace(/^\.\//, "")}`
            : "";

        const thumbnailUrl =
            thumbnailPath
                ? thumbnailUrls[thumbnailPath]
                : undefined;

        card.className = "project-card";
        card.href = `/projects/${project.id}`;

       

        card.innerHTML = `
            <div class="project-image">
                ${
                    thumbnailUrl
                        ? `<img src="${thumbnailUrl}" alt="${project.title} Thumbnail">`
                        : ""
                }
            </div>

            <div class="project-content">
                <h3>${project.title}</h3>

                <p>${project.shortDescription}</p>

                <div class="project-tags">
                    ${project.technologies
                        .map(technology => `<span>${technology}</span>`)
                        .join("")}
                </div>

                <small>
                    ${project.year} · ${project.status}
                </small>
            </div>
        `;

        projectsContainer.appendChild(card);
    }
}