# SMP Platform - UI Design System

## Design Principles

### 1. Layout Structure
```
┌────────────────────────────────────────────┐
│ Collapsible Sidebar │  Top Navigation Bar  │
│                      │                      │
│ [Logo/Brand]         │ Page Title │ Actions │
│                      │                      │
│ Navigation Links     ├──────────────────────┤
│ - Dashboard          │                      │
│ - Products           │  Main Content Area   │
│   - My SKU           │  (Scrollable)        │
│   - Price List       │                      │
│ - Inventory          │                      │
│ - Orders             │                      │
│                      │                      │
│ [Collapse Toggle]    │                      │
└──────────────────────┴──────────────────────┘
```

### 2. Color Palette

#### Primary Colors
- **Blue-600**: `#2563EB` - Primary actions, active states
- **Blue-50**: `#EFF6FF` - Hover states, backgrounds
- **Blue-100**: `#DBEAFE` - Light backgrounds

#### Neutral Colors
- **Gray-900**: `#111827` - Primary text
- **Gray-700**: `#374151` - Secondary text
- **Gray-600**: `#4B5563` - Tertiary text
- **Gray-200**: `#E5E7EB` - Borders
- **Gray-50**: `#F9FAFB` - Background

#### Status Colors
- **Green-600**: `#16A34A` - Success, Connected
- **Red-600**: `#DC2626` - Error, Destructive
- **Orange-600**: `#EA580C` - Warning, Marketplace
- **Yellow-600**: `#CA8A04` - Pending

### 3. Typography

#### Font Sizes
- **text-xs**: 12px (0.75rem) - Helper text, captions
- **text-sm**: 14px (0.875rem) - Body text, labels
- **text-base**: 16px (1rem) - Default text
- **text-lg**: 18px (1.125rem) - Section headers
- **text-xl**: 20px (1.25rem) - Page headers
- **text-2xl**: 24px (1.5rem) - Main titles

#### Font Weights
- **font-normal**: 400 - Body text
- **font-medium**: 500 - Labels, buttons
- **font-semibold**: 600 - Section headers
- **font-bold**: 700 - Emphasis

### 4. Spacing System

#### Padding
- **p-2**: 8px - Compact elements
- **p-3**: 12px - Default elements
- **p-4**: 16px - Comfortable spacing
- **p-6**: 24px - Page padding

#### Margins
- **mb-1**: 4px - Tight spacing
- **mb-2**: 8px - Default spacing
- **mb-4**: 16px - Section spacing
- **mb-6**: 24px - Large spacing

#### Gaps
- **gap-2**: 8px - Compact
- **gap-3**: 12px - Default
- **gap-4**: 16px - Comfortable

### 5. Component Specifications

#### Buttons

**Primary Button**
```css
bg-blue-600 hover:bg-blue-700 text-white
font-medium text-sm px-4 py-2 rounded-lg
```

**Secondary Button**
```css
bg-white border border-gray-300 hover:bg-gray-50 text-gray-900
font-medium text-sm px-4 py-2 rounded-lg
```

**Icon Button**
```css
p-2 rounded-lg hover:bg-gray-100 text-gray-600
```

#### Badges

**Type Badges**
- DMS: `bg-blue-100 text-blue-700 border-blue-300`
- Marketplace: `bg-orange-100 text-orange-700 border-orange-300`

**Status Badges**
- Connected/Active: `bg-green-100 text-green-700 border-green-300`
- Inactive: `bg-gray-100 text-gray-600 border-gray-300`
- Pending: `bg-yellow-100 text-yellow-700 border-yellow-300`

#### Cards
```css
bg-white rounded-lg border border-gray-200 p-6
hover:shadow-lg transition-all
```

#### Inputs
```css
border border-gray-300 rounded-lg px-3 py-2
focus:ring-2 focus:ring-blue-500 focus:border-blue-500
placeholder:text-gray-400
```

### 6. Layout Guidelines

#### Sidebar
- **Width Expanded**: 224px (w-56) - Optimized for menu text
- **Width Collapsed**: 64px (w-16)
- **Item Height**: 40px (h-10)
- **Item Padding**: px-3 py-2.5
- **Active State**: bg-blue-50 text-blue-600 font-medium
- **Logo Height**: 24px (h-6)
- **Collapse Toggle**: Located in header next to logo

#### Top Navigation
- **Height**: 56px (h-14)
- **Border**: border-b border-gray-200
- **Padding**: px-6
- **Background**: bg-white

#### Page Content
- **Background**: bg-gray-50
- **Padding**: p-6
- **Max Width**: max-w-7xl mx-auto (for centered layouts)

#### Data Tables
- **Header**: bg-gray-50 border-b border-gray-200
- **Header Text**: text-xs font-semibold text-gray-700 uppercase
- **Row Height**: min-h-[56px]
- **Row Hover**: hover:bg-gray-50
- **Cell Padding**: px-6 py-4
- **Border**: divide-y divide-gray-200

### 7. Page Structure Template

```tsx
// Standard page structure
<div className="h-full flex flex-col">
  {/* Page Header (Optional if info is in top nav) */}
  <PageHeader
    description="Brief description"
    actions={<Button>Primary Action</Button>}
  />

  {/* Filters/Controls Bar */}
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        {/* Search, Filters */}
      </div>
      <div className="flex items-center gap-2">
        {/* Action Buttons */}
      </div>
    </div>
  </div>

  {/* Main Content Area - Scrollable */}
  <div className="flex-1 overflow-y-auto p-6">
    {/* Page content */}
  </div>

  {/* Optional Fixed Footer */}
  <div className="bg-white border-t border-gray-200 px-6 py-4">
    {/* Summary, Pagination */}
  </div>
</div>
```

### 8. Responsive Breakpoints

- **sm**: 640px
- **md**: 768px (Sidebar appears)
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### 9. Animation & Transitions

**Sidebar Collapse**
```css
transition-all duration-300
```

**Hover States**
```css
transition-colors duration-150
```

**Page Transitions**
```css
transition-all duration-200
```

### 10. Accessibility

- All interactive elements have `:focus` states
- All icons have titles/aria-labels when standalone
- Color contrast meets WCAG AA standards
- Keyboard navigation supported
- Screen reader labels where needed

## Component Usage Examples

### PageHeader
```tsx
<PageHeader
  description="Manage your product catalog"
  actions={
    <>
      <Button variant="outline">Export</Button>
      <Button>Add Product</Button>
    </>
  }
/>
```

### DataTable (Fixed Headers)
```tsx
<DataTable
  columns={columns}
  data={filteredData}
  keyExtractor={(row) => row.id}
  maxHeight="calc(100vh - 16rem)"
  onRowClick={(row) => navigate(`/detail/${row.id}`)}
/>
```

### Filters Bar
```tsx
<div className="bg-white border-b border-gray-200 px-6 py-4">
  <div className="flex items-center gap-3">
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input placeholder="Search..." className="pl-10" />
    </div>
    <Select>...</Select>
    <Button variant="outline">Filters</Button>
  </div>
</div>
```

## Best Practices

1. **Consistency**: Use the same spacing, colors, and patterns across all pages
2. **Efficiency**: Minimize wasted space, use available real estate
3. **Clarity**: Clear visual hierarchy, important actions prominent
4. **Responsiveness**: Mobile-first approach, test all breakpoints
5. **Performance**: Fixed headers for large tables, virtualization if needed
6. **Accessibility**: Keyboard navigation, screen reader support, focus states

## Migration Checklist

- [ ] Update layout to use collapsible sidebar
- [ ] Move page titles to top navigation
- [ ] Standardize page headers with PageHeader component
- [ ] Convert tables to fixed-header DataTable
- [ ] Align filters and actions consistently
- [ ] Update color scheme to new palette
- [ ] Ensure responsive behavior at all breakpoints
- [ ] Add proper spacing using design system
- [ ] Test accessibility
- [ ] Verify consistency across all pages