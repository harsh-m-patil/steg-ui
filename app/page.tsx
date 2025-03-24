"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileImage, Upload } from "lucide-react"
import { encodeMessage, decodeMessage } from "@/lib/steganography"

export default function SteganographyTool() {
  const [activeTab, setActiveTab] = useState("encode")

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Image Steganography Tool</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Hide secret messages within images or extract hidden messages from steganographic images.
      </p>

      <Tabs defaultValue="encode" className="max-w-3xl mx-auto" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="encode">Encode Message</TabsTrigger>
          <TabsTrigger value="decode">Decode Message</TabsTrigger>
        </TabsList>

        <TabsContent value="encode">
          <EncodeTab />
        </TabsContent>

        <TabsContent value="decode">
          <DecodeTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EncodeTab() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [technique, setTechnique] = useState("lsb")
  const [encodedImage, setEncodedImage] = useState<string | null>(null)
  const [isEncoding, setIsEncoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setImage(file)
      setError(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEncode = async () => {
    if (!image) {
      setError("Please select an image")
      return
    }

    if (!message.trim()) {
      setError("Please enter a message to hide")
      return
    }

    setError(null)
    setIsEncoding(true)

    try {
      const result = await encodeMessage(image, message, technique)
      setEncodedImage(result)
    } catch (err) {
      setError("Failed to encode message: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsEncoding(false)
    }
  }

  const handleDownload = () => {
    if (encodedImage) {
      const link = document.createElement("a")
      link.href = encodedImage
      link.download = `steg-encoded-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encode Secret Message</CardTitle>
        <CardDescription>Hide your message within an image using steganography</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="w-full h-32 border-dashed">
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                <FileImage className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select image</span>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </Button>

            {imagePreview && (
              <div className="relative h-32 w-32 border rounded-md overflow-hidden">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Secret Message</Label>
          <Textarea
            id="message"
            placeholder="Enter the secret message you want to hide..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technique">Steganography Technique</Label>
          <Select value={technique} onValueChange={setTechnique}>
            <SelectTrigger id="technique">
              <SelectValue placeholder="Select technique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lsb">Least Significant Bit (LSB)</SelectItem>
              <SelectItem value="lsb-improved">Improved LSB</SelectItem>
              <SelectItem value="patchwork">Patchwork Algorithm</SelectItem>
              <SelectItem value="dct">Discrete Cosine Transform (DCT)</SelectItem>
              <SelectItem value="histogram">Histogram Shifting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleEncode} className="w-full" disabled={isEncoding || !image || !message.trim()}>
          {isEncoding ? "Encoding..." : "Encode Message"}
        </Button>

        {encodedImage && (
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Encoded Image</h3>
              <div className="flex justify-center">
                <img src={encodedImage || "/placeholder.svg"} alt="Encoded" className="max-h-[300px] object-contain" />
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Encoded Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DecodeTab() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [technique, setTechnique] = useState("lsb")
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setImage(file)
      setError(null)
      setDecodedMessage(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDecode = async () => {
    if (!image) {
      setError("Please select an image")
      return
    }

    setError(null)
    setIsDecoding(true)

    try {
      const result = await decodeMessage(image, technique)
      if (result.trim()) {
        setDecodedMessage(result)
      } else {
        setError("No hidden message found or the message is empty")
      }
    } catch (err) {
      setError("Failed to decode message: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsDecoding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decode Hidden Message</CardTitle>
        <CardDescription>Extract a hidden message from a steganographic image</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="decode-image-upload">Upload Encoded Image</Label>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="w-full h-32 border-dashed">
              <label
                htmlFor="decode-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center h-full"
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select encoded image</span>
                <Input
                  id="decode-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </Button>

            {imagePreview && (
              <div className="relative h-32 w-32 border rounded-md overflow-hidden">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="decode-technique">Steganography Technique</Label>
          <Select value={technique} onValueChange={setTechnique}>
            <SelectTrigger id="decode-technique">
              <SelectValue placeholder="Select technique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lsb">Least Significant Bit (LSB)</SelectItem>
              <SelectItem value="lsb-improved">Improved LSB</SelectItem>
              <SelectItem value="patchwork">Patchwork Algorithm</SelectItem>
              <SelectItem value="dct">Discrete Cosine Transform (DCT)</SelectItem>
              <SelectItem value="histogram">Histogram Shifting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleDecode} className="w-full" disabled={isDecoding || !image}>
          {isDecoding ? "Decoding..." : "Decode Message"}
        </Button>

        {decodedMessage && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Decoded Message</h3>
            <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">{decodedMessage}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

