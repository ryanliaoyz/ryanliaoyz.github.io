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
                                style={{ fontSize: 18, fontWeight: 500, display: "block", width: "100%" }}
                            >
                                {p.title}
                            </a>

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
