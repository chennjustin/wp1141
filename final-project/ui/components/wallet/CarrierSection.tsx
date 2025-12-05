/**
 * Carrier section component
 * 
 * Displays the user's device carrier barcode with brightness toggle.
 * Shows real barcode if carrier exists, otherwise shows placeholder pattern.
 */

"use client";

import { useEffect, useRef, useState } from "react";
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
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

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

  const handleCopyCarrierCode = async () => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(carrierCode);
        setIsFadingOut(false);
        setShowCopyToast(true);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setShowCopyToast(false);
            setIsFadingOut(false);
          }, 300); // 淡出动画时间
        }, 1700); // 显示时间
      } catch (error) {
        // Swallow clipboard errors silently for now
      }
    }
  };

  return (
    <section
      className={`relative rounded-xl p-4 text-sm transition-colors ${
        brightCarrier ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      {/* Copy toast notification */}
      {showCopyToast && (
        <div 
          className="absolute left-1/2 top-4 z-10 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 text-xs text-white shadow-2xl border border-gray-600/50 backdrop-blur-sm"
          style={{
            animation: isFadingOut 
              ? 'fadeOut 0.3s ease-in forwards' 
              : 'slideDown 0.3s ease-out, scaleIn 0.3s ease-out',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5 text-green-400"
              style={{
                animation: isFadingOut ? 'none' : 'checkmark 0.4s ease-out 0.1s both',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">已複製載具代碼</span>
          </div>
        </div>
      )}
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

