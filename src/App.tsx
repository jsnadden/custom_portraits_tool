import { useEffect, useState } from "react";
import { type Crops, cropFormats, initialiseCrops, type CropFormatLabel } from "./cropFormats.ts";
import { type CropRectangle, type ImageSize } from "./geometry.ts";
import { CropPreview } from "./CropPreview.tsx";

const maxPreviewScale = 0.7;
const previewGap = 24;

function App() {
	const [sourceUrl, setSourceUrl] = useState<string | null>(null);
	const [sourceSize, setSourceSize] = useState<ImageSize | null>(null);
	const [crops, setCrops] = useState<Crops | null>(null);

	useEffect(() => {
		if (sourceUrl === null) {
			return;
		}
		return () => {
			URL.revokeObjectURL(sourceUrl);
		};
	}, [sourceUrl]);

	return (
		<main>
			<h1>Owlcat Portrait Tool</h1>

			<label>
				Choose a source image: 
				<input
					type="file"
					accept="image/*"
					onChange={(event) => {
						const file = event.currentTarget.files?.[0];
						if (file) {
							setSourceUrl(URL.createObjectURL(file));
							setSourceSize(null);
							setCrops(null);
						}
					}}
				/>
			</label>

			<div
				className="crop-previews"
				style={{
					maxWidth: maxPreviewScale * (cropFormats.full.dims.w + cropFormats.medium.dims.w) + previewGap,
					gap: previewGap,
				}}
			>
				{(Object.keys(cropFormats) as CropFormatLabel[]).map((label) => {
					const currentCrop = crops === null
						? null
						: crops[label];
					return (
						<CropPreview
							key={label}
							label={label}
							sourceUrl={sourceUrl}
							sourceSize={sourceSize}
							currentCrop={currentCrop}
							updateCrop={(transform : (crop : CropRectangle) => CropRectangle) => {
								setCrops((previous) => {
									return (previous === null)
									? previous
									: {
										... previous,
										[label]: transform(previous[label])
									}
								});
							}}
							onImageLoaded={(size : ImageSize) =>{
								setSourceSize(size);
								setCrops(initialiseCrops(size));
							}}
						/>
					);
				})}
			</div>
		</main>
	);
};

export default App;
