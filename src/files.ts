import JSZip from "jszip";

export type Directory = {
	name : string;
	files : [string, Blob | null][];
	children : Directory[];
};

export function stemFromFilePath(path : string) : string {
	const lastSlash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
	const name = lastSlash >= 0 ? path.slice(lastSlash+1) : path;

	const dot = name.indexOf(".");
	if (dot === -1) { // no extension
		return name;
	} else if (dot === 0) { // dotfile
		const nextDot = name.indexOf(".", 1);
		return nextDot >=0 ? name.slice(0,nextDot) : name;
	} else {
		return name.slice(0,dot);
	}
}

export function formatByteSize(size : number) : string {
	if (!Number.isSafeInteger(size) || size < 0) {
		throw new RangeError("size must be a non-negative, safe integer");
	}
	const unitPrefixes : string[] = ["", "Ki", "Mi", "Gi"]; // easily extensible - just add more here

	let index = 0;
	while (index < unitPrefixes.length - 1) {
		if (size < 1<<10) {
			break;
		}

		size /= 1<<10;
		index++;
	}

	return `${size.toFixed(2)} ${unitPrefixes[index]}B`;
}

export async function hashBlobToBytes(blob : Blob) : Promise<Uint8Array> {
	const blobBytes = await blob.arrayBuffer();
	const hash = await crypto.subtle.digest("SHA-256", blobBytes);

	return new Uint8Array(hash);
};

export async function hashBlobToString(blob : Blob) : Promise<string> {
	const hashBytes = Array.from(await hashBlobToBytes(blob));

	return hashBytes.map(byte => {
		return byte.toString(16).padStart(2, "0");
	}).join("");
};

function populateZip(dir : Directory, zip : JSZip | null) {
	if (zip === null) {
		throw new Error(`Failed to add directory ${dir.name} to the zip archive`);
	}

	for (const child of dir.children) {
		const childZip = zip.folder(child.name);
		populateZip(child, childZip);
	}

	for (const [filename, blob] of dir.files) {
		if (blob !== null) {
			zip.file(filename, blob);
		}
	}
};

export async function compressToZip(root : Directory) : Promise<Blob> {
	const archive = new JSZip();
	populateZip(root, archive);

	return archive.generateAsync({ type: "blob" });
};
