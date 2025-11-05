import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conflicting tailwind classes', () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should handle conditional classes with clsx', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('disabled-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['text-red-500', 'bg-blue-500'])
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'border-green-500': true,
      })
      expect(result).toContain('text-red-500')
      expect(result).not.toContain('bg-blue-500')
      expect(result).toContain('border-green-500')
    })

    it('should filter out falsy values', () => {
      const result = cn('text-red-500', null, undefined, false, '', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should return empty string when no classes provided', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex combinations', () => {
      const variant = 'primary'
      const size = 'lg'
      const isDisabled = false

      const result = cn(
        'base-button',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
        },
        size === 'lg' && 'text-lg px-6 py-3',
        size === 'sm' && 'text-sm px-3 py-1',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )

      expect(result).toContain('base-button')
      expect(result).toContain('btn-primary')
      expect(result).toContain('text-lg')
      expect(result).not.toContain('btn-secondary')
      expect(result).not.toContain('opacity-50')
    })

    it('should properly merge responsive and state variants', () => {
      const result = cn(
        'hover:bg-blue-500',
        'md:hover:bg-red-500',
        'lg:hover:bg-green-500'
      )
      expect(result).toContain('hover:bg-blue-500')
      expect(result).toContain('md:hover:bg-red-500')
      expect(result).toContain('lg:hover:bg-green-500')
    })
  })
})
