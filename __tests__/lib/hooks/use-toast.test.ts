import { renderHook } from '@testing-library/react'
import { useToast, toast } from '@/lib/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: jest.fn((title, options) => title),
}))

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('toast function', () => {
    it('should call sonnerToast with title and description', () => {
      toast({ title: 'Test Title', description: 'Test Description' })

      expect(sonnerToast).toHaveBeenCalledWith('Test Title', {
        description: 'Test Description',
      })
    })

    it('should handle toast without description', () => {
      toast({ title: 'Test Title' })

      expect(sonnerToast).toHaveBeenCalledWith('Test Title', {})
    })

    it('should handle toast without title', () => {
      toast({ description: 'Test Description' })

      expect(sonnerToast).toHaveBeenCalledWith('', {
        description: 'Test Description',
      })
    })

    it('should pass additional props to sonnerToast', () => {
      toast({
        title: 'Test',
        description: 'Description',
        duration: 5000,
        position: 'top-right',
      })

      expect(sonnerToast).toHaveBeenCalledWith('Test', {
        description: 'Description',
        duration: 5000,
        position: 'top-right',
      })
    })
  })

  describe('useToast hook', () => {
    it('should return toast utility methods', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current).toHaveProperty('toast')
      expect(result.current).toHaveProperty('success')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('info')
      expect(result.current).toHaveProperty('warning')
      expect(result.current).toHaveProperty('dismiss')
    })

    it('should call success toast', () => {
      const mockSuccess = jest.fn()
      const sonner = sonnerToast as any
      sonner.success = mockSuccess

      const { result } = renderHook(() => useToast())
      result.current.success('Success!', 'Operation completed')

      expect(mockSuccess).toHaveBeenCalledWith('Success!', {
        description: 'Operation completed',
      })
    })

    it('should call error toast', () => {
      const mockError = jest.fn()
      const sonner = sonnerToast as any
      sonner.error = mockError

      const { result } = renderHook(() => useToast())
      result.current.error('Error!', 'Something went wrong')

      expect(mockError).toHaveBeenCalledWith('Error!', {
        description: 'Something went wrong',
      })
    })

    it('should call info toast', () => {
      const mockInfo = jest.fn()
      const sonner = sonnerToast as any
      sonner.info = mockInfo

      const { result } = renderHook(() => useToast())
      result.current.info('Info', 'Information message')

      expect(mockInfo).toHaveBeenCalledWith('Info', {
        description: 'Information message',
      })
    })

    it('should call warning toast', () => {
      const mockWarning = jest.fn()
      const sonner = sonnerToast as any
      sonner.warning = mockWarning

      const { result } = renderHook(() => useToast())
      result.current.warning('Warning!', 'Please be careful')

      expect(mockWarning).toHaveBeenCalledWith('Warning!', {
        description: 'Please be careful',
      })
    })

    it('should handle toast methods without description', () => {
      const mockSuccess = jest.fn()
      const sonner = sonnerToast as any
      sonner.success = mockSuccess

      const { result } = renderHook(() => useToast())
      result.current.success('Success!')

      expect(mockSuccess).toHaveBeenCalledWith('Success!', {
        description: undefined,
      })
    })
  })
})
