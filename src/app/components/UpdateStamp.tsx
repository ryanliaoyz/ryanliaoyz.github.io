"use client";

import { useEffect, useState } from "react";

export default function UpdateStamp() {
    const [date, setDate] = useState<string | null>(null);

    useEffect(() => {
        fetch("/manifest.json")
            .then((r) => r.json())
            .then((m) => {
                if (m?.deployed_at) {
                    setDate(m.deployed_at);
                }
            })
            .catch(() => { });
    }, []);


    if (!date) return null;


    return (
        <div
            style={{
                marginTop: 48,
                fontSize: 12,
                opacity: 0.6,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
        >
            Last update · {date} UTC
        </div>
    );

}
