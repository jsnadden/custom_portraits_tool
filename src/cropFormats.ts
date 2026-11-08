import { type ImageSize, type CropRectangle, makeInitialCrop} from "./geometry";

export type CropFormatLabel = "full" | "medium" | "small";

export type CropFormat = {
	filename: string;
	displayName: string;
	caption: string;
	dims: ImageSize;
};

export type CropFormats = { [Name in CropFormatLabel] : CropFormat };

export const cropFormats = {
	full: {
		filename: "Fulllength.png",
		displayName: "Full Portrait",
		caption: "character sheet",
		dims : {
			w : 692,
			h : 1024,
		},
	},
	medium: {
		filename: "Medium.png",	
		displayName: "Dialogue Portrait",
		caption: "dialogue and storybook scenes",
		dims : {
			w : 330,
			h : 432,
		},
	},
	small: {
		filename: "Small.png",
		displayName: "Thumbnail Portrait",
		caption: "HUD thumbnails",
		dims : {
			w : 185,
			h : 242,
		},
	},
} as const satisfies CropFormats;

export type Crops = { [Name in CropFormatLabel] : CropRectangle };

export function initialiseCrops(source: ImageSize) : Crops {
	return Object.fromEntries(
		Object.entries(cropFormats).map(([label, format]) => {
			return [label, makeInitialCrop(source, format.dims)];
		})
	) as Crops;
};



