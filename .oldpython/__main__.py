import sys
from src.wotr_portraits import command_line, crops_json, gui_app, image_handling

def main():
	# process command-line args
	input_image_path, output_dir_path, headless = command_line.ParseArgs(sys.argv)

	# attempt to load original image
	original_image = image_handling.LoadOriginal(input_image_path)

	#
	json_path = output_dir_path / "crops.json"
	crops_data = crops_json.LoadCropsJson(json_path)

	#default crops
	if crops_data == {}:
		

	#if headless:
		# if json was found, use those crops, otherwise warn and exit
	#else:
		# boot up our gui

	sys.exit(0)

if __name__ == "__main__":
	main()
