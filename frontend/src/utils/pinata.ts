const PINATA_API_KEY = (import.meta as any).env.VITE_PINATA_API_KEY;
const PINATA_SECRET = (import.meta as any).env.VITE_PINATA_SECRET;

export async function uploadToPinata(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Note: We use the local proxy path /pinata-api
    const res = await fetch("/pinata-api/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Pinata Error:", error);
    throw error;
  }
}

export async function uploadJSONToPinata(json: any) {
  try {
    const res = await fetch("/pinata-api/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
      body: JSON.stringify(json),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "JSON Upload failed");
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Pinata JSON Error:", error);
    throw error;
  }
}