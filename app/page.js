"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Share, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShareModal from "./components/share-modal"
import RetrieveModal from "./components/retrieve-modal"
import AnimatedBackground from "./components/animated-background"

export default function Home() {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [retrieveModalOpen, setRetrieveModalOpen] = useState(false)

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Secure File Sharing</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Share files and text securely with a simple 4-digit code
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="h-20 w-48 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => setShareModalOpen(true)}
            >
              <Share className="mr-2 h-5 w-5" />
              Share
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="h-20 w-48 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={() => setRetrieveModalOpen(true)}
            >
              <Download className="mr-2 h-5 w-5" />
              Retrieve
            </Button>
          </motion.div>
        </div>
      </div>

      <ShareModal open={shareModalOpen} onOpenChange={setShareModalOpen} />

      <RetrieveModal open={retrieveModalOpen} onOpenChange={setRetrieveModalOpen} />
    </main>
  )
}

