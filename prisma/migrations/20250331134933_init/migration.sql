-- CreateTable
CREATE TABLE "Clipboard" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "text" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clipboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clipboard_code_key" ON "Clipboard"("code");
