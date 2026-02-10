"use client";

import { useState } from 'react';

export default function EmailContact() {
    const [showContact, setShowContact] = useState(false);

    const a = "eXVuemUgW2F0XQ==";
    const b = "IHplbHZ5bmludGVsbGlnZW5jZSBbZG90XSBjb20=";

    return (
        <span
            onClick={() => setShowContact((v) => !v)}
            style={{
                cursor: 'pointer',
                color: showContact ? 'var(--fg)' : 'var(--link)',
                fontSize: 'inherit',
                textDecoration: showContact ? 'dotted underline' : 'none',
                textUnderlineOffset: '3px',
                transition: 'color 0.1s ease',
            }}
            role="button"
            aria-label="Reveal contact"
        >
            {showContact
                ? `${atob(a)} ${atob(b)}`
                : "Email"
            }
        </span>
    );
}
