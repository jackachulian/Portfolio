import "./style.css";
import { loadProjects } from "./projects";
import { renderProjectPage } from "./project-page";

const path = window.location.pathname;

if (path.startsWith("/projects/")) {
    const id = path.split("/")[2];

    if (id) {
        renderProjectPage(id);
    }
} else {
    renderHomePage();
}

function renderHomePage() {
    const projects = loadProjects();

    const app = document.querySelector<HTMLDivElement>("#app")!;

    app.innerHTML = `
        <header class="hero">
            <h1>Jack Caesar</h1>
            <p>Computer Science Student & Game Developer</p>
        </header>

        <main>
            <section>
                <h2>Projects</h2>

                <div id="projects" class="projects-grid"></div>
            </section>
        </main>
    `;

    const projectsContainer =
        document.querySelector<HTMLDivElement>("#projects")!;

    for (const project of projects) {
        const card = document.createElement("a");

        card.className = "project-card";
        card.href = `/projects/${project.id}`;

        card.innerHTML = `
            <div class="project-image">
                ${
                    project.thumbnail
                        ? `<img src="src/content/projects/${project.id}/${project.thumbnail}" alt="${project.title} Thumbnail">`
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