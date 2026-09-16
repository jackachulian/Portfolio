import "./style.css";
import { marked } from "marked";
import { loadProjects } from "./projects";
import { createShaderBackground } from "./webgl";
// import headerShader from "./shaders/header.frag?raw";
import mainShader from "./shaders/main.frag?raw";

// const thumbnailUrls = import.meta.glob(
//     "/src/content/projects/*/*.{png,jpg,jpeg,webp,gif}",
//     {
//         eager: true,
//         query: "?url",
//         import: "default"
//     }
// ) as Record<string, string>;

async function loadDescription(id: string): Promise<string> {
    // const descriptionUrl = new URL(, import.meta.url).href;
    // get relative to the url (/projects/...)
    const response = await import(`./content/projects/${id}/description.md?raw`);
    console.log(response);

    // if (!response.ok) {
    //     throw new Error("Could not load project description from " + `./content/projects/${id}/description.md`);
    // }

    return await response.default;
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

    console.log(project);

    const thumbnailUrl = project.thumbnail
        ? new URL(`./content/projects/${project.id}/${project.thumbnail}`, import.meta.url).href
        : "";

    // const thumbnailUrl =
    //     thumbnailPath
    //         ? thumbnailUrls[thumbnailPath]
    //         : undefined;


    app.innerHTML = `
        <main class="project-page">
            <a href="/" class="back-button">
                ← Back to Projects
            </a>

            <header>
                <h1>${project.title}</h1>

                 <div class="project-image">
                    ${
                        thumbnailUrl
                            ? `<img src="${thumbnailUrl}" alt="${project.title} Thumbnail">`
                            : ""
                    }
                </div>

                <div class="project-tags">
                    ${project.technologies
                        .map(technology => `<span>${technology}</span>`)
                        .join("")}
                </div>

                <small>
                    ${new Date(project.date).getFullYear()} · ${project.status}
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