"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Download, FileText, File, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { retrieveData } from "../actions/retrieve"

export default function RetrieveModal({ open, onOpenChange }) {
  const [step, setStep] = useState("input")
  const [code, setCode] = useState("")
  const [retrievedContent, setRetrievedContent] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleRetrieve = async () => {
    if (!/^\d{4}$/.test(code)) {
      setError("Please enter a valid 4-digit code")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Call the server action to retrieve data
      const data = await retrieveData(code)
      
      console.log("Retrieved data:", data)
      
      if (!data) {
        setError("No content found with that code")
        setLoading(false)
        return
      }
      
      // Check if the content has expired
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        setError("This content has expired")
        setLoading(false)
        return
      }
      
      setRetrievedContent({
        type: data.type,
        content: data.content,
        fileName: data.fileName,
        fileUrl: data.fileUrl
      })
      
      setStep("result")
    } catch (err) {
      console.error("Error retrieving data:", err)
      setError("Failed to retrieve content. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep("input")
    setCode("")
    setRetrievedContent(null)
    setError("")
    setCopied(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetModal, 300)
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCode(value)
    if (error && /^\d{4}$/.test(value)) {
      setError("")
    }
  }

  const handleDownload = () => {
    if (retrievedContent.fileUrl) {
      window.open(retrievedContent.fileUrl, '_blank');
    }
  }

  const handleCopy = () => {
    if (retrievedContent?.content) {
      navigator.clipboard.writeText(retrievedContent.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {step === "input" ? "Retrieve Shared Content" : "Retrieved Content"}
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
              className="space-y-4"
            >
              <p className="text-gray-400 text-center">Enter the 4-digit code to retrieve shared content</p>

              <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-[240px]">
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="text-center text-2xl h-16 bg-gray-800 border-gray-700"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="0000"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  onClick={handleRetrieve}
                  disabled={code.length !== 4 || loading}
                  className="bg-teal-600 hover:bg-teal-700 mt-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Retrieving...</span>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Retrieve Content
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {retrievedContent && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    {retrievedContent.type === "text" ? (
                      <div className="space-y-4">
                        <div className="flex items-center text-teal-400 mb-2">
                          <FileText className="mr-2 h-5 w-5" />
                          <span className="font-medium">Text Content</span>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-md text-gray-300 max-h-[200px] overflow-y-auto">
                          {retrievedContent.content}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            "Copy to Clipboard"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center text-blue-400 mb-2">
                          <File className="mr-2 h-5 w-5" />
                          <span className="font-medium">File</span>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-md flex items-center justify-between">
                          <span className="text-gray-300 truncate max-w-[200px]">{retrievedContent.fileName || "Download File"}</span>
                          <Button size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={resetModal}>
                  Retrieve Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}