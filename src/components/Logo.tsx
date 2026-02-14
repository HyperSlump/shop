import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <g className="shift-group">
                {/* H Base - White or Primary Text Color for flexibility */}
                <path
                    d="M25 10 L25 90 M75 10 L75 90 M25 50 L75 50"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="square"
                    className="text-white dark:text-white"
                />

                <path
                    d="M65 20 L35 40 L50 50 L65 60 L35 80"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinejoin="miter"
                    strokeMiterlimit="20"
                    className="text-primary"
                />

                {/* Vertical Line - Neon Yellow */}
                <path
                    d="M50 0 V100"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary"
                />
            </g>
        </svg>
    );
}
