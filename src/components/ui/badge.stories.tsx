import type { Meta, StoryObj } from '@storybook/nextjs'
import { Badge, StatusBadge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'paid', 'pending', 'overdue', 'info', 'premium'],
      description: 'The visual style variant of the badge',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
}

// Status Badges
export const Paid: Story = {
  args: {
    children: 'Paid',
    variant: 'paid',
  },
}

export const Pending: Story = {
  args: {
    children: 'Pending',
    variant: 'pending',
  },
}

export const Overdue: Story = {
  args: {
    children: 'Overdue',
    variant: 'overdue',
  },
}

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
}

export const Premium: Story = {
  args: {
    children: 'Premium',
    variant: 'premium',
  },
}

// Status Badge with Icons
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="paid">Paid</StatusBadge>
      <StatusBadge status="pending">Pending</StatusBadge>
      <StatusBadge status="overdue">Overdue</StatusBadge>
      <StatusBadge status="info">Info</StatusBadge>
      <StatusBadge status="premium">Premium</StatusBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges with icons for better accessibility and visual clarity.',
      },
    },
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="paid">Paid</Badge>
      <Badge variant="pending">Pending</Badge>
      <Badge variant="overdue">Overdue</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="premium">Premium</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants in one view.',
      },
    },
  },
}

// Invoice Status Example
export const InvoiceStatusExample: Story = {
  render: () => (
    <div className="space-y-4 p-6 max-w-md">
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div>
          <p className="font-medium">Invoice #INV-001</p>
          <p className="text-sm text-muted-foreground">Due: Jan 15, 2025</p>
        </div>
        <StatusBadge status="paid">Paid</StatusBadge>
      </div>

      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div>
          <p className="font-medium">Invoice #INV-002</p>
          <p className="text-sm text-muted-foreground">Due: Jan 20, 2025</p>
        </div>
        <StatusBadge status="pending">Pending</StatusBadge>
      </div>

      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div>
          <p className="font-medium">Invoice #INV-003</p>
          <p className="text-sm text-muted-foreground">Due: Jan 10, 2025</p>
        </div>
        <StatusBadge status="overdue">Overdue</StatusBadge>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of status badges used in invoice cards.',
      },
    },
  },
}
