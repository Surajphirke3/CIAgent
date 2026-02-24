"use client";
import { useEffect, useRef, useState } from "react";

const LandingBackgroundAnimation = () => {
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);
    const [showVideo2, setShowVideo2] = useState(false);

    useEffect(() => {
        const video1 = video1Ref.current;
        const video2 = video2Ref.current;
        if (!video1 || !video2) return;

        // Phase 1: Play landing1.mp4 once at 1x speed
        video1.playbackRate = 1.0;
        video1.play().catch(() => { });

        const handleVideo1End = () => {
            // Transition to Phase 2
            setShowVideo2(true);
            video2.playbackRate = 1.0;
            video2.play().catch(() => { });
        };

        video1.addEventListener("ended", handleVideo1End);

        return () => {
            video1.removeEventListener("ended", handleVideo1End);
        };
    }, []);

    return (
        <>
            <video
                ref={video1Ref}
                src="/landing1.mp4"
                muted
                playsInline
                preload="auto"
                className={`fixed inset-0 z-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${showVideo2 ? 'opacity-0' : 'opacity-80'}`}
            />
            <video
                ref={video2Ref}
                src="/landing2.mp4"
                muted
                playsInline
                loop
                preload="auto"
                className={`fixed inset-0 z-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${showVideo2 ? 'opacity-80' : 'opacity-0'}`}
            />
            <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none"></div>
        </>
    );
};

export default LandingBackgroundAnimation;

