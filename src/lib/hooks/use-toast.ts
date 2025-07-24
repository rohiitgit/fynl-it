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
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast }