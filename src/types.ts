export interface Project {
    title: string;
    shortDescription: string;
    year: number;
    status: string;

    technologies: string[];
    categories: string[];

    thumbnail?: string;

    links?: {
        github?: string;
        website?: string;
        itch?: string;
    };
}