"use client";

import { useState } from 'react';

export default function EmailContact() {
    const [showContact, setShowContact] = useState(false);

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
                ? `yunze [at] zelvynintelligence [dot] com`
                : "Email"
            }
        </span>
    );
}
