"use client";

import { useEffect, useRef } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

type Props = {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	offscreenRef: React.RefObject<HTMLCanvasElement | null>;
	stream: MediaStream | null;
	blurEnabled: boolean;
	bgImage: HTMLImageElement | null;
	setStream: (s: MediaStream | null) => void;
};

export default function WebcamCanvas({
	videoRef,
	canvasRef,
	offscreenRef,
	stream,
	blurEnabled,
	bgImage,
	setStream,
}: Props) {
	const modelRef = useRef<bodyPix.BodyPix | null>(null);
	const blurRef = useRef(false);
	const bgRef = useRef<HTMLImageElement | null>(null);

	useEffect(() => {
		blurRef.current = blurEnabled;
	}, [blurEnabled]);

	useEffect(() => {
		bgRef.current = bgImage;
	}, [bgImage]);

	useEffect(() => {
		offscreenRef.current = document.createElement("canvas");
		startCamera();
	}, []);

	useEffect(() => {
		if (modelRef.current && stream) processFrame();
	}, [stream]);

	const startCamera = async () => {
		try {
			const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			setStream(s);

			const video = videoRef.current;
			if (!video) return;

			video.srcObject = s;

			video.onloadedmetadata = async () => {
				await video.play();

				const width = video.videoWidth;
				const height = video.videoHeight;

				if (canvasRef.current && width > 0 && height > 0) {
					canvasRef.current.width = width;
					canvasRef.current.height = height;
				}

				const model = await bodyPix.load();
				modelRef.current = model;
				processFrame();
			};
		} catch (err) {
			console.error("Error accessing camera:", err);
		}
	};

	const processFrame = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		const offscreenCanvas = offscreenRef.current;
		const ctx = canvas?.getContext("2d");
		const offscreenCtx = offscreenCanvas?.getContext("2d");

		if (!video || !canvas || !ctx || !offscreenCanvas || !offscreenCtx || !modelRef.current) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		offscreenCanvas.width = video.videoWidth;
		offscreenCanvas.height = video.videoHeight;

		const render = async () => {
			if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused && !video.ended) {
				if (!blurRef.current && !bgRef.current) {
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				} else if(modelRef.current) {
					const segmentation = await modelRef.current.segmentPerson(video, {
						internalResolution: "medium",
						segmentationThreshold: 0.3,
					});

					offscreenCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
					const frame = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);

					for (let i = 0; i < segmentation.data.length; i++) {
						if (segmentation.data[i] === 0) {
							frame.data[i * 4 + 3] = 0;
						}
					}

					ctx.clearRect(0, 0, canvas.width, canvas.height);
					if (bgRef.current) {
						ctx.drawImage(bgRef.current, 0, 0, canvas.width, canvas.height);
					} else if (blurRef.current) {
						ctx.filter = "blur(10px)";
						ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
						ctx.filter = "none";
					}

					offscreenCtx.putImageData(frame, 0, 0);
					ctx.drawImage(offscreenCanvas, 0, 0);
				}
			}
			requestAnimationFrame(render);
		};

		render();
	};

	return <canvas ref={canvasRef} className='max-w-full max-h-full' />;
}
