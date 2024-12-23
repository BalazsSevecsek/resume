import { promises as fs } from "fs";
import path from "path";

export async function convertImageToBase64(filePath) {
  try {
    const fileData = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    const base64 = `data:image/${ext};base64,${fileData.toString("base64")}`;

    console.log(ext, base64.substring(0, 100));
    return base64;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    throw error;
  }
}

// Example usage
// (async () => {
//   const filePath = "balazs_sevecsek.jpg"; // Replace with the path to your image file
//   const base64URI = await convertImageToBase64(filePath);
//   fs.writeFile("balazs_sevecsek_base64_uri", base64URI);
// })();
