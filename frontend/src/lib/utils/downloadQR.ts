import { toPng } from "html-to-image"

export async function downloadQR(
  elementId: string,
  filename: string = "invoice_qr.png"
): Promise<void> {
  const node = document.getElementById(elementId)
  
  if (!node) {
    console.error(`Element with id "${elementId}" not found`)
    return
  }

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })

    const link = document.createElement("a")
    link.download = filename
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error("Error downloading QR code:", error)
    throw error
  }
}

export async function getQRDataUrl(elementId: string): Promise<string> {
  const node = document.getElementById(elementId)
  
  if (!node) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })
    return dataUrl
  } catch (error) {
    console.error("Error converting QR code to data URL:", error)
    throw error
  }
}
