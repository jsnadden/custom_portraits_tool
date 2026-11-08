import { type CropFormatLabel, cropFormats } from "./cropFormats";
import { type Point, type ImageSize, type CropRectangle, makeInitialCrop, zoomCrop } from "./geometry";

export type UpdateCropCallback = (transform: (previous : CropRectangle) => CropRectangle) => void;
export type UpdateSourceSizeCallback = (size : ImageSize) => void;

export type CropPreviewProps = {
	label : CropFormatLabel,
	sourceUrl : string | null,
	sourceSize : ImageSize | null
	currentCrop : CropRectangle | null
	updateCrop : UpdateCropCallback,
	onImageLoaded : UpdateSourceSizeCallback,
};

export function CropPreview(props : CropPreviewProps) {
	const format = cropFormats[props.label];

	return(
		<section
			key={props.label}
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
				style={{ aspectRatio: `${format.dims.w} / ${format.dims.h}` }}
				onWheel={(event) => {
					if (props.currentCrop === null) { return; }

					const element = event.currentTarget;
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

						return zoomCrop(props.sourceSize, previous, scaleFactor, minScaleFactor, cursor_UV);
					});
				}}
			>
				{props.sourceUrl !== null && (
					<img
						src={props.sourceUrl}
						alt={`${format.displayName} preview`}
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

			<p>
				{
					props.currentCrop !== null
						? `x: ${props.currentCrop.x.toFixed(1)}, y: ${props.currentCrop.y.toFixed(1)}, w: ${props.currentCrop.w.toFixed(1)}, h: ${props.currentCrop.h.toFixed(1)}`
						: "No image loaded"
				}
			</p>
		</section>
	);
}

