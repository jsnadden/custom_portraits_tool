import sys
import json
from pathlib import Path

###### TODO: move into portrait.py

def LoadCropsJson(json_path: Path) -> dict:

	json_data = {}
	
	if	json_path.is_file():
		try:
			with open(json_path, 'r') as json_file:
				json_file_data = json.load(json_file)

			# validate loaded json data is as expected
			if isinstance(json_file_data, dict) and len(json_file_data) == 3 and all(
				isinstance(key, str)
				and key in CROP_SIZES
				and isinstance(value, list)
				and len(value) == 4
				and all(type(i) is float for i in value)
				for key,value in json_file_data.items()
			):
				json_data = {key : tuple(value) for key,value in json_file_data.items()}
			else:
				print(f"Loaded json file {str(json_path)} did not contain the expected data.", file=sys.stderr)

		except json.JSONDecodeError as e:
			print(f"Invalid JSON: {e}", file=sys.stderr)
		except PermissionError:
			print("You do not have the required permissions to access this file.", file=sys.stderr)
		except OSError as e:
			print(f"System/IO Error occurred: {e}", file=sys.stderr)			
	else:
		print("Specified file not found: " + str(json_path) , file=sys.stderr)
		
	return json_data

