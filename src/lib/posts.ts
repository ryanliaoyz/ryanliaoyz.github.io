import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BASE_DIR = path.join(process.cwd(), "blog");

export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    description: string;
}

export interface Post extends PostMeta {
    contentHtml: string;
}

export function getAllPosts(): PostMeta[] {
    const files = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith(".md"));
    const posts = files.map((filename) => {
        const slug = filename.replace(/\.md$/, "");
        const raw = fs.readFileSync(path.join(BASE_DIR, filename), "utf-8");
        const {data} = matter(raw);

        return {
            slug,
            title: data.title ?? slug,
            date: data.date ?? "",
            description: data.description ?? "",
        };
    });

    return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}


export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BASE_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}


export async function getPost(slug: string): Promise<Post> {
    const raw = fs.readFileSync(path.join(BASE_DIR, `${slug}.md`), "utf-8");
    const {data, content} = matter(raw);
    const contentHtml = await marked(content);
    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
        contentHtml,
    };
}
