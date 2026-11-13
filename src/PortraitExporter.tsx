import { useState } from "react";
import { type CropRectangle } from "./geometry.ts";
import { type Directory, canvasToPng, hashBlobToString, compressToZip } from "./files.ts";
import { type Crops, type CropFormatLabel, type CropFormat, cropFormats } from "./cropFormats.ts";

type ExportFilesRecord = Record<string, Blob | null>;

type PortraitExporterProps = {
	sourceFile : File | null,
	characterName : string,
	crops : Crops | null
};

async function exportPortrait(sourceFile : File, characterName : string, crops : Crops) : Promise<void> {
	const exportStartTime = performance.now();

	try {
		const sourceImage = await createImageBitmap(sourceFile);
		console.log(`Loaded image data from ${sourceFile.name}.`);
		
		const exportFiles : ExportFilesRecord = {};
		
		try {
			// create cropped portrait images
			for (const [label, format] of (Object.entries(cropFormats) as [CropFormatLabel, CropFormat][])) {
				const crop : CropRectangle = crops[label as CropFormatLabel];

				const canvasElement = document.createElement("canvas");
				canvasElement.id = `canvas-element-${format.filename.toLowerCase()}`;
				canvasElement.width = format.dims.w;
				canvasElement.height = format.dims.h;

				const canvasContext = canvasElement.getContext("2d");
				if (canvasContext === null) {
					throw new Error(`Failed to create a 2D rendering context for exporting the ${format.displayName} crop`);
				}

				canvasContext.drawImage(sourceImage, crop.x, crop.y, crop.w, crop.h, 0, 0, format.dims.w, format.dims.h);
				
				exportFiles[format.filename] = await canvasToPng(canvasElement);
			}

			// create crop data json file 
			const jsonContents = {
				sourceImageHash : await hashBlobToString(sourceFile),
				portraitCrops : crops
			};
			exportFiles["portrait-metadata.json"] = new Blob(
				[JSON.stringify(jsonContents, null, 4)],
				{ type : "application/json" }
			);
			
			// compress to zip file
			const portraitDir : Directory = {
				name : characterName,
				children : [],
				files : Object.entries(exportFiles)
			};

			const archiveRoot : Directory = {
				name : "",
				children : [portraitDir],
				files : []
			};

			const zipBlob = await compressToZip(archiveRoot);
			const downloadUrl = URL.createObjectURL(zipBlob);
			
			//initiate download
			const anchor = document.createElement("a");
			anchor.download = `${characterName}.zip`;
			anchor.href = downloadUrl;
			anchor.click();

			console.log(`Portrait export completed, took ${(performance.now() - exportStartTime).toExponential(2)}ms`);
			
			// revoke url after a minute, more than enough time to download
			setTimeout(() => { URL.revokeObjectURL(downloadUrl) }, 60_000 );
		} finally {
			sourceImage.close();
		}
	} catch (error) {
		console.error("Portrait export failed:", error);
	}
}

export function PortraitExporter(props : PortraitExporterProps) {
	const [isExporting, setIsExporting] = useState(false);
	
	return (
		<section
			className="portrait-exporter"
		>				
			<button
				disabled={props.sourceFile === null || props.crops === null || isExporting}
				onClick={() => {
					if (isExporting) {
						return;
					}

					if (props.sourceFile !== null && props.crops !== null) {
						setIsExporting(true);
						exportPortrait(
							props.sourceFile,
							props.characterName,
							props.crops
						).finally(() => { setIsExporting(false); });
					}
				}}
			>
				{ "Export" }
			</button>
		</section>
	);
};

