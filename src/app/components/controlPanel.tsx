"use client";
import { useCamera } from "../utils/useCamera";

type Props = {
	stream: MediaStream | null;
	isMuted: boolean;
	blurEnabled: boolean;
	setMuted: (m: boolean) => void;
	setStream: (s: MediaStream | null) => void;
	setBlur: (b: boolean) => void;
	setBgImage: (img: HTMLImageElement | null) => void;
	videoRef: React.RefObject<HTMLVideoElement | null>;
};

export default function ControlsPanel({
	stream,
	isMuted,
	blurEnabled,
	setMuted,
	setStream,
	setBlur,
	setBgImage,
	videoRef,
}: Props) {
	const { startCamera, stopCamera, toggleMute } = useCamera();

	const toggleCamera = async () => {
		if (stream) {
			stopCamera(stream);
			setStream(null);
		} else {
			const newStream = await startCamera(videoRef);
			if (newStream) setStream(newStream);
		}
	};

	const toggleBlur = () => {
		if (!blurEnabled) setBgImage(null);
		setBlur(!blurEnabled);
	};

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const img = new Image();
			img.onload = () => setBgImage(img);
			img.src = URL.createObjectURL(file);
			setBlur(false);
		}
	};

	return (
		<div className='bg-[#2b2c2f]/95 flex justify-center p-4 gap-4'>
			<button
				onClick={toggleCamera}
				className='bg-[#3c4043] hover:bg-[#5f6368] rounded-full h-12 w-12 p-3'
				title='Toggle Camera'
			>
				<span className='material-icons'>{stream ? "videocam" : "videocam_off"}</span>
			</button>
			<button
				onClick={() => {
					toggleMute(stream, setMuted);
				}}
				className='bg-[#3c4043] hover:bg-[#5f6368] rounded-full h-12 w-12 p-3'
				title='Toggle Mic'
			>
				<span className='material-icons'>{isMuted ? "mic_off" : "mic"}</span>
			</button>
			<button
				onClick={toggleBlur}
				className='bg-[#3c4043] hover:bg-[#5f6368] rounded-full h-12 w-12 p-3'
				title='Toggle Blur'
			>
				<span className='material-icons'>{blurEnabled ? "blur_on" : "blur_off"}</span>
			</button>
			<label
				className='cursor-pointer bg-[#3c4043] hover:bg-[#5f6368] rounded-full p-3 h-12 w-12'
				title='Upload Background'
			>
				<span className="material-icons">folder</span>
				<input type='file' accept='image/*' onChange={handleUpload} className='hidden' />
			</label>
		</div>
	);
}
