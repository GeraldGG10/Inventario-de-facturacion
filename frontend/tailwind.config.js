/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "on-tertiary-container": "#ffede6",
                "surface-variant": "#e0e3e5",
                "surface": "#f7f9fb",
                "on-error": "#ffffff",
                "on-primary": "#ffffff",
                "secondary": "#505f76",
                "tertiary-fixed": "#ffdbcd",
                "on-primary-fixed": "#00174b",
                "on-tertiary-fixed": "#360f00",
                "tertiary-container": "#bc4800",
                "on-tertiary": "#ffffff",
                "on-secondary-container": "#54647a",
                "inverse-on-surface": "#eff1f3",
                "surface-container-lowest": "#ffffff",
                "on-secondary-fixed": "#0b1c30",
                "tertiary": "#943700",
                "surface-container-high": "#e6e8ea",
                "inverse-primary": "#b4c5ff",
                "error": "#ba1a1a",
                "on-error-container": "#93000a",
                "surface-container-highest": "#e0e3e5",
                "primary-container": "#2563eb",
                "on-surface": "#191c1e",
                "surface-container-low": "#f2f4f6",
                "primary-fixed": "#dbe1ff",
                "on-secondary-fixed-variant": "#38485d",
                "primary-fixed-dim": "#b4c5ff",
                "inverse-surface": "#2d3133",
                "on-primary-container": "#eeefff",
                "on-surface-variant": "#434655",
                "primary": "#004ac6",
                "surface-dim": "#d8dadc",
                "outline": "#737686",
                "surface-container": "#eceef0",
                "surface-tint": "#0053db",
                "background": "#f7f9fb",
                "secondary-fixed": "#d3e4fe",
                "on-background": "#191c1e",
                "outline-variant": "#c3c6d7",
                "secondary-container": "#d0e1fb",
                "error-container": "#ffdad6",
                "on-primary-fixed-variant": "#003ea8",
                "surface-bright": "#f7f9fb",
                "on-secondary": "#ffffff",
                "tertiary-fixed-dim": "#ffb596",
                "secondary-fixed-dim": "#b7c8e1",
                "on-tertiary-fixed-variant": "#7d2d00"
            },
            "borderRadius": {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
            "spacing": {
                "gutter": "24px",
                "header-height": "64px",
                "stack-sm": "8px",
                "sidebar-width": "260px",
                "container-max": "1440px",
                "stack-lg": "24px",
                "stack-md": "16px"
            },
            "fontFamily": {
                "body-sm": ["Inter", "sans-serif"],
                "headline-md": ["Inter", "sans-serif"],
                "data-mono": ["Inter", "sans-serif"],
                "title-sm": ["Inter", "sans-serif"],
                "body-md": ["Inter", "sans-serif"],
                "display-lg": ["Inter", "sans-serif"],
                "label-caps": ["Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
            },
            "fontSize": {
                "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
                "title-sm": ["18px", { "lineHeight": "28px", "fontWeight": "600" }],
                "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                "display-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }]
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries')
    ],
}
