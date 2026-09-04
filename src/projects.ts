import type { Project } from "./types";

const projectFiles = import.meta.glob(
    "/src/content/projects/*/project.json",
    {
        eager: true,
        query: "?raw",
        import: "default"
    }
);

export function loadProjects(): Project[] {
    return Object.values(projectFiles).map(file => {
        return JSON.parse(file as string) as Project;
    });
}