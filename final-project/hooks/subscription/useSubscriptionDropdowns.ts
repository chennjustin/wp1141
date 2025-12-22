import { useState, useEffect } from "react";

/**
 * Hook for managing dropdown states (date pickers, currency selector, calculator)
 */
export function useSubscriptionDropdowns() {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorFor, setCalculatorFor] = useState<"total" | "monthly">("monthly");

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCurrencyDropdown(false);
    setShowCalculator(false);
  };

  // Hide calculator when other fields are focused
  const handleHideCalculator = (onSaveExpression?: () => void) => {
    if (onSaveExpression) {
      onSaveExpression();
    }
    setShowCalculator(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close dropdowns when clicking outside (but not inside the dropdown itself)
      if (
        !target.closest('[data-dropdown="currency"]') &&
        !target.closest('[data-dropdown="startDate"]') &&
        !target.closest('[data-dropdown="endDate"]')
      ) {
        setShowCurrencyDropdown(false);
        // Only close date pickers if clicking outside, not when interacting with date inputs
        if (!target.closest('input[type="date"]')) {
          setShowStartDatePicker(false);
          setShowEndDatePicker(false);
        }
      }
    };

    if (showCurrencyDropdown || showStartDatePicker || showEndDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCurrencyDropdown, showStartDatePicker, showEndDatePicker]);

  return {
    showStartDatePicker,
    setShowStartDatePicker,
    showEndDatePicker,
    setShowEndDatePicker,
    showCurrencyDropdown,
    setShowCurrencyDropdown,
    showCalculator,
    setShowCalculator,
    calculatorFor,
    setCalculatorFor,
    closeAllDropdowns,
    handleHideCalculator,
  };
}

