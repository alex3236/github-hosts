"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface CopyButtonProps {
  text: string;
  ariaLabel?: string;
  idleLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  className?: string;
  preventParentToggle?: boolean;
}

export default function CopyButton({
  text,
  ariaLabel = "复制内容",
  idleLabel = "复制",
  successLabel = "已复制",
  errorLabel = "复制失败",
  className = styles.copyBtn,
  preventParentToggle = false,
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text.trimEnd());
      setStatus("success");
    } catch {
      setStatus("error");
    }

    window.setTimeout(() => {
      setStatus("idle");
    }, 1800);
  }

  const label = status === "success" ? successLabel : status === "error" ? errorLabel : idleLabel;

  return (
    <button
      type="button"
      onMouseDown={(event) => {
        if (!preventParentToggle) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        if (preventParentToggle) {
          event.preventDefault();
          event.stopPropagation();
        }
        void handleCopy();
      }}
      className={`${className} ${status === "success" ? styles.copyBtnSuccess : ""} ${status === "error" ? styles.copyBtnError : ""}`}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
