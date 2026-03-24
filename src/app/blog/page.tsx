import { getAllPosts } from "@/lib/posts";

export default function BlogIndex() {
    const posts = getAllPosts();

    return (
        <main className="container" style={{ width: "100%", display: "block" }}>
            <div style={{ width: "100%", maxWidth: "100%", textAlign: "left" }}>
                <p style={{ margin: "22px 0 4px" }}>
                    <a href="/">Back</a>
                </p>

                <h1 style={{ fontSize: 36, fontWeight: 500, margin: "22px 0 16px" }}>Blog</h1>

                {posts.length === 0 && <p className="muted">No posts yet.</p>}

                <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
                    {posts.map((p) => (
                        <li key={p.slug} style={{ marginBottom: 18, width: "100%" }}>
                            <a
                                href={`/blog/${p.slug}`}
                                style={{ fontSize: 18, fontWeight: 500 }}

                            >
                                {p.title}
                            </a>
                            {p.tags.includes("ai-gen") && (
                                <span style={{
                                    fontSize: 12,
                                    border: "1px solid var(--muted)",
                                    borderRadius: 4,
                                    padding: "1px 6px",
                                    marginLeft: 8,
                                    color: "var(--muted)",
                                    cursor: "help",
                                }} title="This post was generated solely or with the help of AI and may not fully reflect the author's views. Reference at your own discretion.">AI-generated</span>
                            )}

                            <div className="muted" style={{ fontSize: 14, width: "100%" }}>
                                {p.date}{p.description ? ` · ${p.description}` : ""}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
