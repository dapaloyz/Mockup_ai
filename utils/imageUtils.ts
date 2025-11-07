/**
 * Converts a File object to a base64 encoded data URL.
 * @param file - The file to convert.
 * @returns A promise that resolves with the data URL string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Parses a data URL to extract the base64 data and mime type.
 * @param dataUrl - The data URL string (e.g., "data:image/png;base64,...").
 * @returns An object containing the base64 data and mime type.
 */
export const parseDataUrl = (dataUrl: string): { data: string; mimeType: string } => {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid data URL format");
    }
    return { mimeType: matches[1], data: matches[2] };
}
