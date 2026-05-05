import { getAllSlugs, getPost } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";

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
        <main className="container" style={{ width: "100%", display: "block" }}>
            <p style={{ margin: "22px 0 4px" }}>
                <Link href="/blog"> Back</Link>
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 500, margin: "8px 0 4px" }}>{post.title}</h1>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 20px" }}>{post.date}
                {post.updated && <span> (Updated {post.updated}) </span>}
                {post.tags.filter((t) => t !== "ai-gen").map((tag) => (
                    <span key={tag} style={{
                        fontSize: 12,
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "1px 6px",
                        marginLeft: 6,
                    }}>{tag}</span>
                ))}
            </p>
            <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </main>
    );
}
