"use client";

import { useState } from 'react';

export default function EmailContact() {
    const [showContact, setShowContact] = useState(false);

    const a = "eXVuemUgW2F0XQ==";
    const b = "IHplbHZ5bmludGVsbGlnZW5jZSBbZG90XSBjb20=";

    return (
        <span
            onClick={(e) => {
                e.currentTarget.style.textDecoration = showContact ? 'none' : 'dotted underline';
                setShowContact(!showContact);
            }}
            style={{
                cursor: 'pointer',
                color: showContact ? '#000000': '#0070f3',
                fontSize: 'inherit',
                textDecoration: showContact ? 'dotted underline' : 'none',
                textUnderlineOffset : '3px',
                transition: 'color 0.1s ease'
            }}
            onMouseEnter = {(e) => {
                if (!showContact) e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave = {(e) => {
                e.currentTarget.style.textDecoration = showContact? 'dotted underline' : 'none';
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
