import { type Crops } from "./cropFormats";

type ExporterProps = {
	sourceFile : File | null,
	crops : Crops | null
};

export function Exporter(props : ExporterProps) {
	const disabled : boolean = props.sourceFile === null || props.crops === null;
	
	return (
		<section
			className="exporter"
		>
				
			<button
				disabled={disabled}
				onClick={(event) =>{
					console.log(`exporting button pressed at ${event.timeStamp}`)
				}}
			>
				Export
			</button>

		</section>
	);
};

