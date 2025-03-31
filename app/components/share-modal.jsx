"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Copy, Check, AlertCircle, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { uploadData } from "../actions/upload"

export default function ShareModal({ open, onOpenChange }) {
  const [step, setStep] = useState("input")
  const [activeTab, setActiveTab] = useState("text")
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleShare = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Handle file upload
      let fileData = null;
      if (file) {
        // Convert file to base64
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('File read error'));
          reader.readAsDataURL(file); // This creates a proper data URL
        });
      }
      
      // Call the server action
      const generatedCode = await uploadData(activeTab === "text" ? text : "", fileData);
      
      setCode(generatedCode);
      setStep("code");
    } catch (error) {
      console.error("Error sharing content:", error);
      setError(error.message || "Failed to share content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size - limit to 10MB
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }
      
      setFile(e.target.files[0])
      setError(null);
    }
  }

  const resetModal = () => {
    setStep("input")
    setText("")
    setFile(null)
    setCode("")
    setError(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetModal, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-y-auto bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {step === "input" ? "Share Content" : "Your Sharing Code"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger className="border-2 border-blue-900" value="text">Text</TabsTrigger>
                  <TabsTrigger className="border-2 border-blue-900" value="file">File</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                <Textarea
                placeholder="Enter the text you want to share..."
                className="h-96 bg-gray-800 border-gray-700 resize-none overflow-y-auto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                />

                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="file-upload"
                        type="file"
                        className="bg-gray-800 border-gray-700"
                        onChange={handleFileChange}
                      />
                    </div>
                    {file && (
                      <p className="text-sm text-gray-400 mt-2">
                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleShare}
                  disabled={(activeTab === "text" && !text) || (activeTab === "file" && !file) || loading || error}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Code
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <p className="text-gray-400 mb-4 text-center">
                Your content is ready to be shared. Use this code to retrieve it:
              </p>

              <Card className="w-full p-6 bg-gray-800 border-gray-700 flex flex-col items-center">
                <div className="text-4xl font-bold tracking-wider mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  {code.split("").join(" ")}
                </div>

                <Button variant="outline" size="sm" className="mt-2" onClick={handleCopyCode}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </Card>

              <div className="flex items-center mt-4 text-sm text-amber-400">
                <Clock className="h-4 w-4 mr-2" />
                <p>This code will expire in 2 hours. Make sure to save it!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}