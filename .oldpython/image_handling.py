import sys
from pathlib import Path
from PIL import Image

# returns None if failed to load
def LoadImageFromFile(image_path : Path) -> Image.Image | None:
	loaded_image = None

	if not image_path.is_file():
		print(f"File not found: {str(image_path)}" , file=sys.stderr)
		return None
	
	try:
		with Image.open(image_path, 'r') as image_file:
			loaded_image = image_file.copy()

	except ValueError as e:
		print(f"Failed to load image: {e}", file=sys.stderr)
		loaded_image = None
	except PermissionError:
		print("You do not have the required permissions to access this file.", file=sys.stderr)
		loaded_image = None
	except OSError as e:
		print(f"System/IO Error occurred: {e}", file=sys.stderr)
		loaded_image = None

	if loaded_image is None:
		print(f"Failed to load image from: {str(image_path)}", file=sys.stderr)
	else:
		print(f"Successfully loaded image from: {str(image_path)}", file=sys.stdout)

	return loaded_image


# ensure output directory exists
	#output_dir_path.mkdir(parents=False, exist_ok=True)

	# USING crop_data, CREATE/EDIT OUTPUT IMAGES AND SAVE TO DISC (HANDLING FILE IO ERRORS)
	#output_file_paths = {
	#		"full" : output_dir_path / "Fulllength.png",
	#		"medium" : output_dir_path / "Medium.png",
	#		"small" : output_dir_path / "Small.png"
	#	}