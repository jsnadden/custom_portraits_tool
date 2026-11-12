import { useEffect, useRef } from "react";
import { type CropFormatLabel, cropFormats } from "./cropFormats.ts";
import { type Point, type ImageSize, type CropRectangle, makeInitialCrop, scaleCrop, translateCrop } from "./geometry.ts";

type UpdateCropCallback = (transform: (previous : CropRectangle) => CropRectangle) => void;
type UpdateSourceSizeCallback = (size : ImageSize) => void;

type DragCropRef = {
	pointerID : number,
	startingPosition : Point,
	startingCrop : CropRectangle,
};

type CropPreviewProps = {
	label : CropFormatLabel,
	sourceUrl : string | null,
	sourceSize : ImageSize | null
	currentCrop : CropRectangle | null
	updateCrop : UpdateCropCallback,
	onImageLoaded : UpdateSourceSizeCallback,
};

export function CropPreview(props : CropPreviewProps) {
	const format = cropFormats[props.label];

	const frameRef = useRef<HTMLDivElement | null>(null);
	const dragRef = useRef<DragCropRef | null>(null);

	useEffect(() => {
		const element = frameRef.current;

		if (element === null) {
			return;
		}

		function wheelHandler(event : WheelEvent) {
			if (props.currentCrop === null || element === null) {
				return;
			}

			event.preventDefault();

			// don't allow zooming/scrolling while panning
			if (dragRef.current !== null) {
				//console.log(`scrolled wheel while dragRef.current is non-null: pointerID=${dragRef.current.pointerID}`);
				return;
			}

			const borderBox = element.getBoundingClientRect();

			const cursor_UV : Point = {
				x: (event.clientX - element.clientLeft - borderBox.left) / element.clientWidth,
				y: (event.clientY - element.clientTop - borderBox.top) / element.clientHeight
			}

			const zoomSensitivity = 0.0007;
			const scaleFactor : number = Math.exp(zoomSensitivity * event.deltaY);

			props.updateCrop(previous => {
				if (props.sourceSize === null) {
					return previous;
				}

				const initialCrop = makeInitialCrop(props.sourceSize, format.dims);
				const minDimension = Math.min(100, initialCrop.w, initialCrop.h);
				const minScaleFactor = Math.max(minDimension / previous.w, minDimension / previous.h);

				return scaleCrop(props.sourceSize, previous, scaleFactor, minScaleFactor, cursor_UV);
			});			
		};

		element.addEventListener("wheel", wheelHandler, { passive: false });

		return () => {
			element.removeEventListener("wheel", wheelHandler);
		};

	}, [props, format.dims]);

	return(
		<section
			className="crop-preview"
			style={{
				gridArea: props.label,
				width: props.label === "small"
					? `${100 * format.dims.w / cropFormats.medium.dims.w}%`
					: "100%",
			}}
		>
			<div
				className="crop-frame"
				ref={frameRef}
				style={{ aspectRatio: `${format.dims.w} / ${format.dims.h}` }}
				onPointerDown={(event) => {
					if (dragRef.current !== null) {
						return;
					}

					if (event.button !== 0) {
						return;
					}

					if (props.currentCrop === null) {
						return;
					}

					event.currentTarget.setPointerCapture(event.pointerId);
					event.preventDefault();

					dragRef.current = {
						pointerID: event.pointerId,
						startingPosition: { x: event.clientX, y: event.clientY },
						startingCrop: props.currentCrop,
					};
				}}
				onPointerMove={(event) => {
					if (dragRef.current === null) {
						return;
					}

					if (event.pointerId !== dragRef.current.pointerID) {
						return;
					}

					const displacement_UV : Point = {
						x: -(event.clientX - dragRef.current.startingPosition.x) / event.currentTarget.clientWidth,
						y: -(event.clientY - dragRef.current.startingPosition.y) / event.currentTarget.clientHeight
					};

					const startingCrop = dragRef.current.startingCrop;

					props.updateCrop(previous => {
						if (props.sourceSize === null) {
							return previous;
						}

						return translateCrop(props.sourceSize, startingCrop, displacement_UV);
					});	
				}}
				onPointerUp={(event) => {
					if (dragRef.current === null) {
						return;
					}

					if (event.pointerId !== dragRef.current.pointerID) {
						return;
					}

					if (event.button !== 0) {
						return;
					}
					
					dragRef.current = null;
				}}
				onPointerCancel={(event) => {
					if (dragRef.current === null) {
						return;
					}

					if (event.pointerId !== dragRef.current.pointerID) {
						return;
					}

					dragRef.current = null;
				}}
				onLostPointerCapture={(event) => {
					if (dragRef.current === null) {
						return;
					}

					if (event.pointerId !== dragRef.current.pointerID) {
						return;
					}

					dragRef.current = null;
				}}
			>
				{props.sourceUrl !== null && (
					<img
						src={props.sourceUrl}
						alt={`${format.displayName} preview`}
						draggable={false}
						style={
							props.currentCrop !== null && props.sourceSize !== null
								? {
									width: `${100 * props.sourceSize.w / props.currentCrop.w}%`,
									height: `${100 * props.sourceSize.h / props.currentCrop.h}%`,
									left: `${-100 * props.currentCrop.x / props.currentCrop.w}%`,
									top: `${-100 * props.currentCrop.y / props.currentCrop.h}%`,
								}
								: undefined
						}
						onLoad={(event) => {
							// this makes sure we don't initialise the crops redundantly
							if (props.label !== "full") {
								return;
							}

							const image = event.currentTarget;
							const imageSize = {
								w: image.naturalWidth,
								h: image.naturalHeight,
							};

							props.onImageLoaded(imageSize)
						}}
					/>
				)}
			</div>
		</section>
	);
}

