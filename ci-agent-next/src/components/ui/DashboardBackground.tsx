"use client";
import { useState } from "react";

const DashboardBackground = () => {
    const [introFinished, setIntroFinished] = useState(false);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            {/* Intro video (plays once) */}
            <video
                src="/main-bg.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => setIntroFinished(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${introFinished ? "opacity-0" : "opacity-80"
                    }`}
            />

            {/* Looping background video (fades in after intro) */}
            <video
                src="/main-loop-bg.mp4"
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${introFinished ? "opacity-80" : "opacity-0"
                    }`}
            />

            {/* Overlay to ensure dashboard text remains legible */}
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-10 pointer-events-none"></div>
        </div>
    );
};

export default DashboardBackground;
