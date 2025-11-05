import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render a button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render with default variant and size', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'button')
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render with default variant', () => {
      const { container } = render(<Button variant="default">Default</Button>)
      expect(container.firstChild).toHaveClass('bg-primary')
    })

    it('should render with destructive variant', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>)
      expect(container.firstChild).toHaveClass('bg-destructive')
    })

    it('should render with outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>)
      expect(container.firstChild).toHaveClass('border')
    })

    it('should render with secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>)
      expect(container.firstChild).toHaveClass('bg-secondary')
    })

    it('should render with ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>)
      expect(container.firstChild).toHaveClass('hover:bg-accent')
    })

    it('should render with link variant', () => {
      const { container } = render(<Button variant="link">Link</Button>)
      expect(container.firstChild).toHaveClass('text-primary')
      expect(container.firstChild).toHaveClass('underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('should render with default size', () => {
      const { container } = render(<Button size="default">Default Size</Button>)
      expect(container.firstChild).toHaveClass('h-9')
    })

    it('should render with small size', () => {
      const { container } = render(<Button size="sm">Small</Button>)
      expect(container.firstChild).toHaveClass('h-8')
    })

    it('should render with large size', () => {
      const { container } = render(<Button size="lg">Large</Button>)
      expect(container.firstChild).toHaveClass('h-10')
    })

    it('should render with icon size', () => {
      const { container } = render(<Button size="icon">🔥</Button>)
      expect(container.firstChild).toHaveClass('size-9')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('should handle click events when enabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not handle click events when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('asChild prop', () => {
    it('should render as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Button')
    })

    it('should apply button styles to child component', () => {
      const { container } = render(
        <Button asChild variant="destructive">
          <a href="/delete">Delete Link</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-destructive')
    })
  })

  describe('HTML Attributes', () => {
    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should support aria attributes', () => {
      render(<Button aria-label="Close dialog">X</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('should support data attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render with text content', () => {
      render(<Button>Text Content</Button>)
      expect(screen.getByText('Text Content')).toBeInTheDocument()
    })

    it('should render with icon and text', () => {
      render(
        <Button>
          <span>🔥</span>
          Hot Button
        </Button>
      )
      expect(screen.getByText('Hot Button')).toBeInTheDocument()
      expect(screen.getByText('🔥')).toBeInTheDocument()
    })

    it('should render with only icon', () => {
      render(<Button size="icon">🔥</Button>)
      expect(screen.getByText('🔥')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).not.toHaveFocus()
    })

    it('should have proper button role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
