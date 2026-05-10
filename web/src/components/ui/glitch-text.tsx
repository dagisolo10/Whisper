import { FC, CSSProperties } from "react";

interface GlitchTextProps {
    children: string;
    speed?: number;
    enableShadows?: boolean;
    enableOnHover?: boolean;
    className?: string;
}

interface CustomCSSProperties extends CSSProperties {
    "--after-duration": string;
    "--before-duration": string;
    "--after-shadow": string;
    "--before-shadow": string;
}

const GlitchText: FC<GlitchTextProps> = ({ children, speed = 0.5, enableShadows = true, enableOnHover = false, className = "" }) => {
    const inlineStyles: CustomCSSProperties = {
        "--after-duration": `${speed * 3}s`,
        "--before-duration": `${speed * 2}s`,
        "--after-shadow": enableShadows ? "-3px 0 red" : "none",
        "--before-shadow": enableShadows ? "3px 0 cyan" : "none",
    };

    const baseClasses = "text-white text-[clamp(2rem,10vw,8rem)] font-black relative mx-auto select-none mix-blend-screen";

    const pseudoClasses = !enableOnHover
        ? "after:content-[attr(data-text)] after:absolute after:inset-0 after:text-white after:bg-transparent after:overflow-hidden after:[clip-path:inset(0_0_0_0)] after:[text-shadow:var(--after-shadow)] after:animate-glitch-after after:opacity-70 " +
          "before:content-[attr(data-text)] before:absolute before:inset-0 before:text-white before:bg-transparent before:overflow-hidden before:[clip-path:inset(0_0_0_0)] before:[text-shadow:var(--before-shadow)] before:animate-glitch-before before:opacity-70"
        : "after:content-[''] after:absolute after:inset-0 after:text-white after:bg-transparent after:overflow-hidden after:[clip-path:inset(0_0_0_0)] after:opacity-0 " +
          "before:content-[''] before:absolute before:inset-0 before:text-white before:bg-transparent before:overflow-hidden before:[clip-path:inset(0_0_0_0)] before:opacity-0 " +
          "hover:after:content-[attr(data-text)] hover:after:opacity-70 hover:after:[text-shadow:var(--after-shadow)] hover:after:animate-glitch-after " +
          "hover:before:content-[attr(data-text)] hover:before:opacity-70 hover:before:[text-shadow:var(--before-shadow)] hover:before:animate-glitch-before";

    const combinedClasses = `${baseClasses} ${pseudoClasses} ${className}`;

    return (
        <div style={inlineStyles} data-text={children} className={combinedClasses}>
            {children}
        </div>
    );
};

export default GlitchText;
