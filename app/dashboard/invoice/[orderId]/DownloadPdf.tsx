"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Props {
  orderId: string;
}

export default function DownloadPdf({
  orderId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;

    const receipt = document.getElementById("receipt");

    if (!receipt) {
      console.error("Receipt element not found");
      return;
    }

    try {
      setLoading(true);

      // Tunggu render font & image selesai
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(receipt, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        skipFonts: false,
      });

      const img = new Image();

      img.src = dataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const imgWidth = usableWidth;
      const imgHeight =
        (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(
        dataUrl,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();

        pdf.addImage(
          dataUrl,
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        heightLeft -= usableHeight;
      }

      pdf.save(`Invoice-${orderId}.pdf`);
    } catch (error) {
      console.error(error);

      alert("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Generating...
        </>
      ) : (
        <>
          <Download size={18} />
          Download PDF
        </>
      )}
    </button>
  );
}