"use client";

import WebcamCanvas from "./components/webcamCanvas";
import ControlsPanel from "./components/controlPanel";
import { useRef, useState } from "react";

export default function Home() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const offscreenRef = useRef<HTMLCanvasElement | null>(null);

	const [stream, setStream] = useState<MediaStream | null>(null);
	const [blurEnabled, setBlur] = useState(false);
	const [isMuted, setMuted] = useState(false);
	const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

	return (
		<div className='bg-[#202124] text-white font-sans h-screen flex flex-col'>
			<div className='flex-1 flex items-center justify-center relative'>
				<WebcamCanvas
					videoRef={videoRef}
					canvasRef={canvasRef}
					offscreenRef={offscreenRef}
					stream={stream}
					blurEnabled={blurEnabled}
					bgImage={bgImage}
					setStream={setStream}
				/>
				<video ref={videoRef} autoPlay playsInline className='hidden' />
			</div>
			<ControlsPanel
				stream={stream}
				isMuted={isMuted}
				blurEnabled={blurEnabled}
				setMuted={setMuted}
				setStream={setStream}
				setBlur={setBlur}
				setBgImage={setBgImage}
				videoRef={videoRef}
			/>
		</div>
	);
}