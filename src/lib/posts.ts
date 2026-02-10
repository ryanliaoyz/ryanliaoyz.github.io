import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BASE_DIR = path.join(process.cwd(), "blog");

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

export function getSortedPosts(): Post[] {
  const files = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BASE_DIR, filename), "utf-8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: (data.title as string) ?? slug,
        date: (data.date as string) ?? "",
        description: (data.description as string) ?? "",
        content: marked(content) as string,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): Post | undefined {
  const filepath = path.join(BASE_DIR, `${slug}.md`);
  if (!fs.existsSync(filepath)) return undefined;

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    description: (data.description as string) ?? "",
    content: marked(content) as string,
  };
}
