import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Skeleton,
  InvoiceCardSkeleton,
  InvoiceListSkeleton,
  TableSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
} from './skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// Basic Skeleton
export const Default: Story = {
  render: () => (
    <div className="space-y-3 w-80">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
}

// Avatar Skeletons
export const Avatars: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <AvatarSkeleton size="sm" />
      <AvatarSkeleton size="md" />
      <AvatarSkeleton size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar skeleton loaders in different sizes.',
      },
    },
  },
}

// Text Skeletons
export const Text: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-sm font-medium mb-2">Single line</p>
        <TextSkeleton width="1/2" lines={1} />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Paragraph (3 lines)</p>
        <TextSkeleton width="full" lines={3} />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Half width</p>
        <TextSkeleton width="1/2" lines={1} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text skeleton loaders with configurable width and line count.',
      },
    },
  },
}

// Card Skeleton
export const Card: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard card skeleton loaders.',
      },
    },
  },
}

// Invoice Card Skeleton
export const InvoiceCard: Story = {
  render: () => (
    <div className="max-w-3xl">
      <InvoiceCardSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Invoice card skeleton matching the actual invoice card structure.',
      },
    },
  },
}

// Invoice List Skeleton
export const InvoiceList: Story = {
  render: () => (
    <div className="max-w-3xl">
      <InvoiceListSkeleton count={5} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple invoice card skeletons for list loading states.',
      },
    },
  },
}

// Table Skeleton
export const Table: Story = {
  render: () => (
    <div className="max-w-4xl">
      <TableSkeleton rows={5} columns={4} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table skeleton with header and rows.',
      },
    },
  },
}

// Complex Loading State
export const ComplexLoadingState: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Invoice List */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <InvoiceListSkeleton count={3} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex loading state showing multiple skeleton types together.',
      },
    },
  },
}

// Profile Loading
export const ProfileLoading: Story = {
  render: () => (
    <div className="max-w-md">
      <div className="flex items-start gap-4">
        <AvatarSkeleton size="lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Profile section loading state with avatar and text.',
      },
    },
  },
}
