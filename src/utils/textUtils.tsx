import React from 'react';

/**
 * Parses a string and formats special notations like fractions, exponents, and subscripts into JSX.
 * @param text The input string to format.
 * @returns A React.ReactNode with formatted text.
 */
export const formatText = (text: string): React.ReactNode => {
    // Regex to find and capture fractions (e.g., 1/2), exponents (e.g., x^2, 10^-3), and subscripts (e.g., H_2)
    const regex = /(\d+\/\d+)|([a-zA-Z0-9]+\^[\(\)a-zA-Z0-9\+\-]+)|([a-zA-Z0-9]+_[a-zA-Z0-9]+)/g;
    
    if (!text) return text;

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;

                // Check for fraction: e.g., "1/2"
                if (part.match(/^\d+\/\d+$/)) {
                    const [numerator, denominator] = part.split('/');
                    return (
                        <span key={index} className="fraction">
                            <span className="numerator">{numerator}</span>
                            <span className="denominator">{denominator}</span>
                        </span>
                    );
                }
                
                // Check for exponent: e.g., "x^2" or "10^(-3)"
                if (part.includes('^')) {
                    const splitPoint = part.indexOf('^');
                    const base = part.substring(0, splitPoint);
                    const exponent = part.substring(splitPoint + 1);
                    if (base && exponent) {
                        return <span key={index}>{base}<sup>{exponent}</sup></span>;
                    }
                }

                // Check for subscript: e.g., "H_2"
                if (part.includes('_')) {
                    const splitPoint = part.indexOf('_');
                    const base = part.substring(0, splitPoint);
                    const sub = part.substring(splitPoint + 1);
                    if (base && sub) {
                        return <span key={index}>{base}<sub>{sub}</sub></span>;
                    }
                }

                return part;
            })}
        </>
    );
};
