import { getAllPosts } from "@/lib/posts";

export default function BlogIndex() {
    const posts = getAllPosts();

    return (

        <main className="container" style={{ flex:1  }}>
            <p style={{ margin: "22px 0 4px" }}>
                <a href="/"> Back</a>
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 500, margin: "22px 0 16px" }}>Blog</h1>
            {posts.length === 0 && <p className="muted">No posts yet.</p>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {posts.map((p) => (
                    <li key={p.slug} style={{ marginBottom: 18 }}>
                        <a href={`/blog/${p.slug}`} style={{ fontSize: 18, fontWeight: 500 }}>
                            {p.title}
                        </a>
                        <div className="muted" style={{ fontSize: 14 }}>
                            {p.date}{p.description ? ` · ${p.description}` : ""}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
