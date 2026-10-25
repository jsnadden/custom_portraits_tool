import os
import sys
import argparse
from pathlib import Path

def ParseArgs(argv: (list | None) = None) -> tuple[Path | None, Path | None, str | None, bool]:

	arg_parser = argparse.ArgumentParser()
	arg_parser.add_argument('-i', '--image', dest='image', help="filepath of character image", type=str)
	arg_parser.add_argument('-c','--char', dest='charname', help="name of character", type=str)
	arg_parser.add_argument('-p', '--portraits', dest='portraits', help="directory where game looks for custom portraits, by default: %%APPDATA%%\\LocalLow\\Owlcat Games\\Pathfinder Wrath Of The Righteous\\Portraits", type=str)
	arg_parser.add_argument('-n', '--no-gui', '--headless', dest='headless', action='store_true', help="enable headless mode: looks for cropping specification in json file")
	args = arg_parser.parse_args(argv)

	# default values
	input_image_path = None
	char_name = None

	# validate a provided image filepath
	if args.image is not None:
		input_image_path = Path(args.image)
		if input_image_path.is_file():
			# if an image filepath is valid, the default character name inherits from this
			char_name = input_image_path.stem()
		else:
			print(f"Specified file not found: {str(input_image_path)}" , file=sys.stderr)
			input_image_path = None

	# warn/exit if no image in headless mode
	if input_image_path is None and args.headless:
		print("Must provide a valid image filepath in headless mode", file=sys.stderr)
		sys.exit(2)

	# use a provided character name, overriding above defaults
	char_name = args.charname

	# validate provided portraits directory
	portraits_path = None
	if args.portraits is not None:
		portraits_path = Path(args.portraits)
		if not portraits_path.is_dir():
			print(f"Specified portraits directory not found: {str(portraits_path)}" , file=sys.stderr)
			portraits_path = None

	# if necessary, validate default portraits directory
	if portraits_path is None:
		portraits_path = Path(os.environ["LOCALAPPDATA"]).parent / "LocalLow" / "Owlcat Games" / "Pathfinder Wrath Of The Righteous" / "Portraits"
		if not portraits_path.is_dir():
			print(f"Default portraits directory not found: {str(portraits_path)}. Check installation" , file=sys.stderr)
			sys.exit(2)

	return input_image_path, portraits_path, char_name, args.headless