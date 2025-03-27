import { useCallback } from "react";

export const useCamera = () => {
	const startCamera = useCallback(
		async (videoRef: React.RefObject<HTMLVideoElement | null>): Promise<MediaStream | null> => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { width: { ideal: 1280 }, height: { ideal: 720 } },
					audio: true,
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					await videoRef.current.play();
				}

				return stream;
			} catch (err) {
				console.error("Failed to start camera:", err);
				return null;
			}
		},
		[]
	);

	const stopCamera = useCallback((stream: MediaStream | null) => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}
	}, []);

	const toggleMute = useCallback((stream: MediaStream | null, setMuted: (val: boolean) => void) => {
		if (stream) {
			const newMuted = !stream.getAudioTracks()[0]?.enabled;
			stream.getAudioTracks().forEach((track) => (track.enabled = newMuted));
			setMuted(!newMuted);
		}
	}, []);

	return {
		startCamera,
		stopCamera,
		toggleMute,
	};
};
