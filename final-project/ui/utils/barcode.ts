/**
 * Barcode utility functions
 * 
 * This module provides utility functions for barcode generation
 * and pattern creation for placeholder displays.
 */

/**
 * Generate barcode pattern from carrier code (for placeholder when no carrier)
 * Barcode width:height ratio is 1:3.5, height is 64px (h-16), so width should be 224px
 */
export function generateBarcodePattern(code: string): number[] {
  const pattern: number[] = [];
  const minWidth = 2;
  const maxWidth = 5;
  const gapWidth = 0.5; // gap between bars
  const targetTotalWidth = 224; // 1:3.5 ratio with 64px height (64 * 3.5 = 224)
  const numBars = Math.floor(code.length * 3.5); // Generate enough bars to fill width
  
  let currentWidth = 0;
  
  // Generate pattern based on code characters
  for (let i = 0; i < numBars && currentWidth < targetTotalWidth; i++) {
    const charIndex = i % code.length;
    const char = code[charIndex];
    const charCode = char.charCodeAt(0);
    // Generate width between min and max based on character code
    const width = minWidth + ((charCode + i) % (maxWidth - minWidth + 1));
    const roundedWidth = Math.round(width * 10) / 10;
    
    // Calculate total width including gap (except for last bar)
    const widthWithGap = currentWidth + roundedWidth + (i < numBars - 1 ? gapWidth : 0);
    
    // Ensure we don't exceed target width
    if (widthWithGap <= targetTotalWidth) {
      pattern.push(roundedWidth);
      currentWidth += roundedWidth + (i < numBars - 1 ? gapWidth : 0);
    } else {
      // Add remaining width if there's space
      const remaining = targetTotalWidth - currentWidth;
      if (remaining > minWidth) {
        pattern.push(remaining);
      }
      break;
    }
  }
  
  return pattern;
}

/**
 * Barcode display constants
 */
export const BARCODE_HEIGHT = 64; // h-16 = 64px
export const BARCODE_WIDTH = BARCODE_HEIGHT * 3.5; // 224px for 1:3.5 ratio

