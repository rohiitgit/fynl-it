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
          "--success-bg": "rgb(34 197 94 / 0.1)",
          "--success-border": "rgb(34 197 94 / 0.3)",
          "--success-text": "rgb(21 128 61)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          success: "border-green-500/20 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 dark:border-green-500/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
