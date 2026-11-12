import { type CropRectangle } from "./geometry.ts";
import { type Directory, formatByteSize, hashBlobToString, compressToZip } from "./files.ts";
import { type Crops, type CropFormatLabel, type CropFormat, cropFormats } from "./cropFormats.ts";

type ExportFilesRecord = Record<string, Blob | null>;

function canvasToPng(element : HTMLCanvasElement) : Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		element.toBlob(
			(blob) => {
				if (blob !== null) {
					resolve(blob);
					console.log(`Cropped png file from ${element.id}, of size ${formatByteSize(blob.size)}`);
					
				} else {
					reject(new Error(`Failed to create png file from ${element.id}`));
				}
			},
			"image/png"
		);
	});
}

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

			//initiate download
			const anchor = document.createElement("a");
			anchor.download = `${characterName}`;
			anchor.href = URL.createObjectURL(zipBlob);
			anchor.click();

			console.log(`Portrait export completed, took ${(performance.now() - exportStartTime).toExponential(2)}ms`);
		} finally {
			sourceImage.close();
		}
	} catch (error) {
		console.error("Portrait export failed:", error);
	}
}

export function PortraitExporter(props : PortraitExporterProps) {
	const disabled : boolean = props.sourceFile === null || props.crops === null;
	
	return (
		<section
			className="portrait-exporter"
		>				
			<button
				disabled={disabled}
				onClick={() => {
					if (props.sourceFile !== null && props.crops !== null) {
						exportPortrait(props.sourceFile, props.characterName, props.crops);
					}	
				}}
			>
				Export
			</button>
		</section>
	);
};

