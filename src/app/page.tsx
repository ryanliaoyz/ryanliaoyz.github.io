import EmailContact from './components/EmailContact';
import UpdateStamp from './components/UpdateStamp';

export default function Home() {
    return (
        <main className="container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <section
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 28,
                    flexWrap: "wrap",
                    paddingTop: 22,
                    paddingBottom: 22,
                }}
            >
                <div style={{ flex: "1 1 420px", minWidth: 280 }}>
                    <h1 style={{ margin: 0, fontSize: 43, letterSpacing: -.8, fontWeight: 500 }}>Yunze Liao</h1>

                    <p className="muted" style={{ margin: "12px 0 0" }}>
                        I build systems for analysis, modeling, and decision-making, grounded in first-principles reasoning and risk-aware design. My work focuses on performance-oriented infrastructure that translates quantitative theory into dependable, deployable, and scalable systems.
                    </p>
                    <p className="muted" style={{ margin: "12px 0 0" }}>
                        This site mainly serves as a small archive of notes and short essays on ideas, experiments, and lessons learned while building.
                    </p>
                    <p className="muted" style={{ margin: "10px 0 0" }}>
                        <b>Now</b>: Working on some stuff ML.
                    </p>

                    <p style={{ margin: "16px 0 0" }}>
                        <a href="/blog">Blog</a> {"  ·  "}
                        <a href="https://github.com/ryanliaoyz" target="_blank" rel="noreferrer">GitHub</a> {"  ·  "}
                        <a href="https://www.linkedin.com/in/yunze-liao-a44566215/" target="_blank" rel="noreferrer me">Linkedin</a> {"  ·  "}
                        <a href="/cv.pdf" target="_blank" rel="noreferrer">CV</a>{"  ·  "}
                        <EmailContact />
                    </p>
                </div>
            </section>

            <hr />

            <section>
                <h2 style={{ margin: "0 0 10px", fontSize: 30, fontWeight: 500 }}>Recent</h2>
            </section>
            <footer style={{ marginTop: "auto", paddingTop: 16 }}>
                <hr style={{ margin: "0 0 14px" }} />
                <UpdateStamp />
            </footer>
        </main>
    );
}
