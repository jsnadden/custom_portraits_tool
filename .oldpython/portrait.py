from pathlib import Path
from wotr_portraits import image_handling, globals

# represents a normalised cropping window within an image, relative to its width/height
class CropRectangle:
	def __init__(self, x : float = 0.0, y : float = 0.0, width : float = 1.0, height : float = 1.0):
		self.x : float = x
		self.y : float = y
		self.w : float = width
		self.h : float = height

class Portrait:
	def __init__(self, original_image_path: Path | None = None, output_dir: Path | None = None, char_name: str | None = None):
		self.original_image_path = original_image_path
		self.output_dir = output_dir
		self.char_name = char_name

		if original_image_path is not None:
			self.original_image = image_handling.LoadImageFromFile(original_image_path)

		# default 
		
		self.crop_data = {globals.CROP_SIZES[i] : (0.0, 0.0, 1.0/(i+1), 1.0/(i+1)) for i in range(3)}