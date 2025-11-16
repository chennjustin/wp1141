"use client";

import { useEffect, useRef } from "react";
import Barcode from "react-barcode";

interface BarcodeDisplayProps {
  carrierCode: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BarcodeDisplay({
  carrierCode,
  width = 2,
  height = 100,
  className = "",
}: BarcodeDisplayProps) {
  // 移除載具條碼開頭的 / 符號，因為條碼通常不需要它
  const barcodeValue = carrierCode.startsWith("/") 
    ? carrierCode.substring(1) 
    : carrierCode;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Barcode
          value={barcodeValue}
          format="CODE128"
          width={width}
          height={height}
          displayValue={true}
          fontSize={16}
          textAlign="center"
          textPosition="bottom"
          background="transparent"
          lineColor="#000000"
        />
      </div>
      <p className="mt-2 text-sm text-gray-600 font-mono">
        {carrierCode}
      </p>
    </div>
  );
}

