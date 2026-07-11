"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#C9F2CF",
          "--success-border": "var(--ink)",
          "--success-text": "#0F5A28",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "rounded-none border-2 border-ink shadow-[4px_4px_0_0_var(--ink)]",
          success: "border-ink bg-[#C9F2CF] text-[#0F5A28]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
