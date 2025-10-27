"use client"

import { motion } from "framer-motion"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"

interface QRCodeDisplayProps {
  value: string
  label?: string
  downloadFileName?: string
}

export function QRCodeDisplay({ value, label, downloadFileName = "invoice_qr.png" }: QRCodeDisplayProps) {
  const handleDownload = async () => {
    const qrElement = document.getElementById("qr-code-display")
    if (!qrElement) return

    try {
      const dataUrl = await toPng(qrElement, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      })
      
      const link = document.createElement("a")
      link.download = downloadFileName
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center space-y-4"
    >
      <Card className="p-6 bg-white">
        <CardContent className="p-0">
          <div id="qr-code-display" className="bg-white p-4 rounded-xl">
            <QRCode
              value={value}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
        </CardContent>
      </Card>
      
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Download QR Code
      </Button>
    </motion.div>
  )
}
