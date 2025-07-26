'use client'
import { toast as sonnerToast, ExternalToast } from "sonner"

type ToastProps = ExternalToast & {
  title?: string
  description?: string
}

function toast({ title, description, ...props }: ToastProps) {
  return sonnerToast(title || "", {
    description,
    ...props,
  })
}

function useToast() {
  return {
    toast,
    success: (title: string, description?: string) => sonnerToast.success(title, { description }),
    error: (title: string, description?: string) => sonnerToast.error(title, { description }),
    info: (title: string, description?: string) => sonnerToast.info(title, { description }),
    warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }