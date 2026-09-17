export interface Project {
    id: string;
    title: string;
    shortDescription: string;
    date: string;
    status: string;
    displayOnHomepage?: boolean;

    technologies: string[];
    categories: string[];

    thumbnail?: string;

    links?: {
        github?: string;
        website?: string;
        itch?: string;
    };
}