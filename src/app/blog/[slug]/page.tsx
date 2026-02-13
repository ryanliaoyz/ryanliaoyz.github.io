import { getAllSlugs, getPost } from "@/lib/posts";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);
    return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!getAllSlugs().includes(slug)) notFound();

    const post = await getPost(slug);

    return (
        <main className="container" style={{ flex: 1 }}>
            <p style={{ margin: "22px 0 4px" }}>
                <a href="/blog">← Back</a>
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 500, margin: "8px 0 4px" }}>{post.title}</h1>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 20px" }}>{post.date}</p>
            <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </main>
    );
}
