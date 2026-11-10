

type SourceSelectedCallback = (file : File) => void;

type SourcePickerProps = {
	onSourceSelected: SourceSelectedCallback	
};

export function SourcePicker(props : SourcePickerProps) {
	return(
		<section
			className="source-picker"
		>
			<label>
				Choose a source image: 
				<input
					type="file"
					accept="image/*"
					onChange={(event) => {
						const file = event.currentTarget.files?.[0];
						if (file) {
							props.onSourceSelected(file);
						}
					}}
				/>
			</label>
		</section>
	);
};

