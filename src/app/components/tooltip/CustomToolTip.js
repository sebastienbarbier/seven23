import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import Tooltip from "@mui/material/Tooltip";

/**
 * Controlled tooltip component that displays on both hover and click.
 * Can be used in controlled or uncontrolled mode.
 *
 * @param {boolean} open - Controlled open state (optional)
 * @param {function} onOpen - Callback when tooltip opens (optional)
 * @param {function} onClose - Callback when tooltip closes (optional)
 * @param {React.ReactNode} children - The element that triggers the tooltip
 * @param {string} title - The tooltip content
 * @param {object} tooltipProps - Additional props to pass to MUI Tooltip
 */
export default function CustomToolTip({
  open: controlledOpen,
  placement,
  onOpen,
  onClose,
  children,
  arrow,
  disableInteractive,
  title,
  ...tooltipProps
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [clickedOpen, setClickedOpen] = useState(false);
  const containerRef = useRef(null);

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen || clickedOpen;

  const handleOpen = useCallback(
    (event) => {
      // Only handle hover opens if not clicked open
      if (!clickedOpen) {
        if (!isControlled) {
          setInternalOpen(true);
        }
        if (onOpen) {
          onOpen(event);
        }
      }
    },
    [isControlled, onOpen, clickedOpen]
  );

  const handleClose = useCallback(
    (event) => {
      // Only handle hover closes if not clicked open
      if (!clickedOpen) {
        if (!isControlled) {
          setInternalOpen(false);
        }
        if (onClose) {
          onClose(event);
        }
      }
    },
    [isControlled, onClose, clickedOpen]
  );

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      // Toggle on click - check current open state
      const currentlyOpen = isControlled ? controlledOpen : internalOpen || clickedOpen;
      const newClickedState = !currentlyOpen;
      
      setClickedOpen(newClickedState);

      if (newClickedState) {
        // Opening via click
        if (!isControlled) {
          setInternalOpen(true);
        }
        if (onOpen) {
          onOpen(event);
        }
      } else {
        // Closing via click
        if (!isControlled) {
          setInternalOpen(false);
        }
        if (onClose) {
          onClose(event);
        }
      }
    },
    [clickedOpen, isControlled, controlledOpen, internalOpen, onOpen, onClose]
  );

  // Handle click away to close tooltip when opened by click
  useEffect(() => {
    if (!clickedOpen) {
      return;
    }

    const handleClickAway = (event) => {
      // Check if click is outside the container
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // Check if click is not on any tooltip element (MUI renders tooltips in a portal)
        const tooltipElements = document.querySelectorAll('[role="tooltip"]');
        let isClickInsideTooltip = false;
        
        tooltipElements.forEach((tooltip) => {
          if (tooltip.contains(event.target)) {
            isClickInsideTooltip = true;
          }
        });

        if (!isClickInsideTooltip) {
          // Close the tooltip
          setClickedOpen(false);
          if (!isControlled) {
            setInternalOpen(false);
          }
          if (onClose) {
            onClose(event);
          }
        }
      }
    };

    // Add event listener with a slight delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickAway);
      document.addEventListener("touchstart", handleClickAway);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("touchstart", handleClickAway);
    };
  }, [clickedOpen, isControlled, onClose]);

  // Extract slotProps and componentsProps from tooltipProps to merge properly
  const { slotProps: tooltipSlotProps, componentsProps: tooltipComponentsProps, ...restTooltipProps } = tooltipProps || {};

  return (
    <Tooltip
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      placement={placement}
      title={title}
      disableInteractive={false}
      arrow={arrow}
      slotProps={{
        tooltip: {
          sx: {
            fontSize: "0.7em", // Ensure consistent font size
            paddingLeft: 1,
            paddingRight: 1,
            marginLeft: "14px !important",
            ...(tooltipSlotProps?.tooltip?.sx || {}),
            ...(tooltipComponentsProps?.tooltip?.sx || {}),
          },
          ...(tooltipSlotProps?.tooltip || {}),
          ...(tooltipComponentsProps?.tooltip || {}),
        },
        ...(tooltipSlotProps || {}),
        ...(tooltipComponentsProps || {}),
      }}
      {...restTooltipProps}
    >
      {React.cloneElement(children, {
        ref: containerRef,
        onClick: handleClick,
        style: {
          ...(children.props ? children.props.style : {}),
          cursor: "pointer",
          display: "inline-block",
        },
      })}
    </Tooltip>
  );
}

CustomToolTip.propTypes = {
  open: PropTypes.bool,
  placement: PropTypes.string,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  arrow: PropTypes.bool,
};

