/**
 * Carrier section component
 * 
 * Displays the user's device carrier barcode with brightness toggle.
 * Shows real barcode if carrier exists, otherwise shows placeholder pattern.
 */

"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { generateBarcodePattern, BARCODE_HEIGHT, BARCODE_WIDTH } from "@/ui/utils/barcode";

interface CarrierSectionProps {
  carrierCode: string;
  hasRealCarrier: boolean;
  carrierLoading: boolean;
  brightCarrier: boolean;
  onToggleBrightness: () => void;
}

export function CarrierSection({
  carrierCode,
  hasRealCarrier,
  carrierLoading,
  brightCarrier,
  onToggleBrightness,
}: CarrierSectionProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const barcodePattern = generateBarcodePattern(carrierCode);

  // Generate real barcode when carrier is available
  useEffect(() => {
    if (hasRealCarrier && barcodeRef.current && carrierCode) {
      try {
        // Clear previous barcode
        barcodeRef.current.innerHTML = "";
        
        JsBarcode(barcodeRef.current, carrierCode, {
          format: "CODE39",
          height: BARCODE_HEIGHT,
          displayValue: false, // Don't show text below barcode (text is shown separately)
          background: "transparent",
          lineColor: brightCarrier ? "#000000" : "#FFFFFF",
          width: 2, // Standard width for Code 39
          margin: 10, // Adequate margin for scanning
          valid: function(valid) {
            if (!valid) {
              console.error("Invalid barcode data:", carrierCode);
            }
          },
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [hasRealCarrier, carrierCode, brightCarrier]);

  const handleCopyCarrierCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(carrierCode).catch(() => {
        // Swallow clipboard errors silently for now
      });
    }
  };

  return (
    <section
      className={`rounded-xl p-4 text-sm transition-colors ${
        brightCarrier ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">載具</span>
        <button
          type="button"
          className="flex items-center gap-2 text-xs"
          onClick={onToggleBrightness}
        >
          <span>亮度調整</span>
          <span
            className={`flex h-4 w-8 items-center rounded-full p-0.5 transition-colors ${
              brightCarrier ? "bg-gray-300" : "bg-gray-600"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full bg-white transition-transform ${
                brightCarrier ? "translate-x-3.5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Barcode area */}
      <div className="mb-3 flex flex-col items-center gap-3">
        {/* Barcode - real barcode if carrier exists, otherwise placeholder */}
        <div className="flex items-center justify-center" style={{ width: `${BARCODE_WIDTH}px`, minHeight: `${BARCODE_HEIGHT}px` }}>
          {hasRealCarrier && !carrierLoading ? (
            <svg ref={barcodeRef} style={{ maxWidth: "100%", height: "auto" }} />
          ) : (
            <div className="flex items-center justify-center gap-0.5">
              {barcodePattern.map((width, index) => (
                <span
                  key={index}
                  className={`block h-16 ${
                    brightCarrier ? "bg-black" : "bg-white"
                  }`}
                  style={{ width: `${width}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Carrier code and copy icon */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`inline-flex h-4 w-4 items-center justify-center rounded border hover:opacity-70 ${
              brightCarrier ? "border-black" : "border-white"
            }`}
            onClick={handleCopyCarrierCode}
            aria-label="Copy carrier code"
          >
            <span
              className={`h-2 w-2 border ${
                brightCarrier ? "border-black" : "border-white"
              }`}
            />
          </button>
          <span className={`text-sm font-mono ${
            brightCarrier ? "text-black" : "text-white"
          }`}>{carrierCode}</span>
        </div>
      </div>
    </section>
  );
}

