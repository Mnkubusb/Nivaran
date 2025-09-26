import data from './resources.json';

export type Resource = {
    id: string;
    title: string;
    description: string;
    type: "Video" | "Audio" | "Article" | "Guide";
    source: "YouTube" | "Spotify" | "Internal" | "Web";
    url: string;
    thumbnail: string;
};

export const resources: Resource[] = data.resources;
