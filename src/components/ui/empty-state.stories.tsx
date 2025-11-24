import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  EmptyState,
  InvoiceEmptyState,
  SearchEmptyState,
  FilteredEmptyState,
  ErrorEmptyState,
} from './empty-state'
import { Plus, RefreshCw } from 'lucide-react'

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'invoices', 'search', 'error', 'noResults'],
      description: 'The type of empty state (affects icon)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the empty state',
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

// Basic Empty States
export const Default: Story = {
  args: {
    type: 'default',
    title: 'No items yet',
    description: 'Get started by creating your first item.',
    action: {
      label: 'Create Item',
      onClick: () => alert('Create clicked'),
    },
  },
}

export const Invoices: Story = {
  args: {
    type: 'invoices',
    title: 'No invoices yet',
    description: 'You haven\'t created any invoices. Create your first invoice to start getting paid faster.',
    action: {
      label: 'Create Invoice',
      onClick: () => alert('Create invoice clicked'),
      icon: <Plus className="h-4 w-4" />,
    },
  },
}

export const Search: Story = {
  args: {
    type: 'search',
    title: 'No results found',
    description: 'We couldn\'t find any invoices matching your search. Try adjusting your search terms.',
    action: {
      label: 'Clear Search',
      onClick: () => alert('Clear search clicked'),
    },
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Something went wrong',
    description: 'We couldn\'t load your data. Please try again.',
    action: {
      label: 'Retry',
      onClick: () => alert('Retry clicked'),
      icon: <RefreshCw className="h-4 w-4" />,
    },
  },
}

// Sizes
export const Small: Story = {
  args: {
    type: 'invoices',
    title: 'No items',
    description: 'There are no items to display.',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    type: 'invoices',
    title: 'No invoices yet',
    description: 'Create your first invoice to get started.',
    size: 'md',
    action: {
      label: 'Create Invoice',
      onClick: () => alert('Create clicked'),
    },
  },
}

export const Large: Story = {
  args: {
    type: 'invoices',
    title: 'No invoices yet',
    description: 'You haven\'t created any invoices. Create your first invoice to start getting paid faster.',
    size: 'lg',
    action: {
      label: 'Create Invoice',
      onClick: () => alert('Create clicked'),
      icon: <Plus className="h-4 w-4" />,
    },
  },
}

// With Secondary Action
export const WithSecondaryAction: Story = {
  args: {
    type: 'invoices',
    title: 'No invoices yet',
    description: 'Get started by creating your first invoice or importing existing ones.',
    action: {
      label: 'Create Invoice',
      onClick: () => alert('Create clicked'),
      icon: <Plus className="h-4 w-4" />,
    },
    secondaryAction: {
      label: 'Import Invoices',
      onClick: () => alert('Import clicked'),
    },
  },
}

// Pre-configured Components
export const InvoiceEmpty = {
  render: () => (
    <InvoiceEmptyState onCreateInvoice={() => alert('Create invoice')} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured empty state for invoice lists.',
      },
    },
  },
}

export const SearchEmpty = {
  render: () => (
    <SearchEmptyState
      searchQuery="payment"
      onClearSearch={() => alert('Clear search')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured empty state for search results.',
      },
    },
  },
}

export const FilteredEmpty = {
  render: () => (
    <FilteredEmptyState
      filterType="overdue"
      onClearFilter={() => alert('Clear filter')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured empty state for filtered results.',
      },
    },
  },
}

export const ErrorEmpty = {
  render: () => (
    <ErrorEmptyState onRetry={() => alert('Retry')} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured empty state for errors.',
      },
    },
  },
}

// In Context Examples
export const InvoiceListContext = {
  render: () => (
    <div className="min-h-[400px] border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <p className="text-sm text-muted-foreground">Manage your invoices</p>
      </div>

      <InvoiceEmptyState onCreateInvoice={() => alert('Create invoice')} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown in context of an invoice list page.',
      },
    },
  },
}

export const DashboardContext = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Invoices</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">₹0</p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold">Recent Invoices</h3>
        </div>
        <EmptyState
          type="invoices"
          title="No invoices yet"
          description="Create your first invoice to start tracking payments."
          size="sm"
          action={{
            label: 'Create Invoice',
            onClick: () => alert('Create invoice'),
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state in a dashboard context with stats cards.',
      },
    },
  },
}
