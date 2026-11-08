import { clamp } from "./maths";

export type Point = {
	x: number;
	y: number;
}

export type ImageSize = {
	w: number;
	h: number;
};

export type CropRectangle = {
	x: number;
	y: number;
	w: number;
	h: number;
};

export function makeInitialCrop(source: ImageSize, output: ImageSize) : CropRectangle {
	const fitScale = Math.min(source.w / output.w, source.h / output.h);

	const w = fitScale * output.w;
	const h = fitScale * output.h;

	const x = (source.w - w) / 2;
	const y = (source.h - h) / 2;

	return { x,y,w,h };
};

export function zoomCrop(source: ImageSize, crop: CropRectangle, scaleFactor: number, minScaleFactor : number, centre_UV: Point) : CropRectangle {
	if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
		throw new RangeError("scaleFactor must have a finite, positive numerical value");
	}

	const centre_uv : Point = {
		x: crop.x + crop.w * centre_UV.x,
		y: crop.y + crop.h * centre_UV.y

	};
	
	const maxScaleFactor : number = Math.min(source.w / crop.w, source.h / crop.h);	
	scaleFactor = clamp(scaleFactor, minScaleFactor, maxScaleFactor);

	const newCrop : CropRectangle = {
		x: centre_uv.x + scaleFactor * (crop.x - centre_uv.x),
		y: centre_uv.y + scaleFactor * (crop.y - centre_uv.y),
		w: scaleFactor * crop.w,
		h: scaleFactor * crop.h
	};

	// handle possible rounding errors
	const epsilon = 16 * Number.EPSILON * Math.max(1, source.w, source.h);
	if (source.w - newCrop.w <= -epsilon || source.h - newCrop.h <= -epsilon) {
		throw new RangeError(`The calculated crop dimensions (${newCrop.w}, ${newCrop.h}) exceed those of the source image (${source.w}, ${source.h}) by more than ${epsilon} tolerance`);
	}

	// clamp crop within source image
	newCrop.x = clamp(newCrop.x, .0, Math.max(0, source.w - newCrop.w));
	newCrop.y = clamp(newCrop.y, .0, Math.max(0, source.h - newCrop.h));

	return newCrop;
};

