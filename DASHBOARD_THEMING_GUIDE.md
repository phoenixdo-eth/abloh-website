# Dashboard Theming Guide

This guide explains the theming patterns used across the Studio Abloh dashboard and how to apply them consistently.

## 🎨 Core Design Principles

### 1. **Layout Structure**
All dashboard pages follow this structure:
```tsx
<SidebarProvider>
  <AppSidebar variant="inset" />
  <SidebarInset>
    <SiteHeader />
    <div className="flex flex-1 flex-col">
      {/* Page content */}
    </div>
  </SidebarInset>
</SidebarProvider>
```

### 2. **Container Classes**
- **Main container**: `@container/main flex flex-1 flex-col gap-2`
- **Content wrapper**: `flex flex-col gap-4 py-4 md:gap-6 md:py-6`
- **Horizontal padding**: `px-4 lg:px-6` (for consistent spacing)

## 📊 Metric Cards

### Card Grid Layout
```tsx
<div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
```

**Key Features**:
- Responsive grid: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- Container queries: `@xl/main` and `@5xl/main` for responsive breakpoints
- Gradient background: `from-primary/5 to-card` with dark mode support
- Consistent gap: `gap-4`
- Shadow: `shadow-xs` for subtle elevation

### Card Structure
```tsx
<Card className="@container/card">
  <CardHeader className="relative">
    <CardDescription>{label}</CardDescription>
    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
      {value}
    </CardTitle>
    <div className="absolute right-4 top-4">
      <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
        <TrendingUpIcon className="size-3" />
        {percentage}
      </Badge>
    </div>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      {trend} <TrendingIcon className="size-4" />
    </div>
    <div className="text-muted-foreground">{description}</div>
  </CardFooter>
</Card>
```

**Styling Details**:
- **Header**: Relative positioning for absolute badge placement
- **Title**: Responsive text size (`text-2xl` → `text-3xl` at 250px+)
- **Numbers**: `tabular-nums` for aligned digits
- **Badge**: Top-right absolute position with trend indicator
- **Footer**: Two-line layout with bold trend and muted description

### Badge Variants
```tsx
// Positive trend (green)
<Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
  <TrendingUpIcon className="size-3" />
  +12.5%
</Badge>

// Negative trend (red)
<Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
  <TrendingDownIcon className="size-3" />
  -20%
</Badge>
```

## 📈 Charts

### Chart Container
```tsx
<Card className="@container/card">
  <CardHeader className="relative">
    <CardTitle>Chart Title</CardTitle>
    <CardDescription>Chart Description</CardDescription>
    <div className="absolute right-4 top-4">
      {/* Time range selector */}
    </div>
  </CardHeader>
  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      {/* Chart component */}
    </ChartContainer>
  </CardContent>
</Card>
```

### Chart Configuration
```tsx
const chartConfig = {
  metric1: {
    label: "Label",
    color: "hsl(var(--chart-1))", // Uses CSS variable
  },
  metric2: {
    label: "Label 2",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
```

**Available Chart Colors**:
- `--chart-1`: Primary color (default: orange/blue)
- `--chart-2`: Secondary color (default: teal/cyan)
- `--chart-3`: Tertiary color (default: dark blue/yellow)
- `--chart-4`: Fourth color (default: tan/purple)
- `--chart-5`: Fifth color (default: orange/pink)

### Gradient Fills
```tsx
<defs>
  <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="var(--color-metric)" stopOpacity={1.0} />
    <stop offset="95%" stopColor="var(--color-metric)" stopOpacity={0.1} />
  </linearGradient>
</defs>
```

### Responsive Time Range Selector
```tsx
{/* Desktop: Toggle Group */}
<ToggleGroup
  type="single"
  value={timeRange}
  onValueChange={setTimeRange}
  variant="outline"
  className="@[767px]/card:flex hidden"
>
  <ToggleGroupItem value="30d" className="h-8 px-2.5">
    Last 30 days
  </ToggleGroupItem>
</ToggleGroup>

{/* Mobile: Select Dropdown */}
<Select value={timeRange} onValueChange={setTimeRange}>
  <SelectTrigger className="@[767px]/card:hidden flex w-40">
    <SelectValue placeholder="Last 3 months" />
  </SelectTrigger>
  <SelectContent className="rounded-xl">
    <SelectItem value="30d" className="rounded-lg">
      Last 30 days
    </SelectItem>
  </SelectContent>
</Select>
```

## 🗂️ Data Tables

### Table Wrapper
```tsx
<DataTable data={data} />
```

The `DataTable` component automatically includes:
- Sortable columns
- Filtering
- Pagination
- Responsive design
- Dark mode support

## 🌗 Dark Mode Support

All components automatically support dark mode through CSS variables:

### Card Backgrounds
- Light: `bg-gradient-to-t from-primary/5 to-card`
- Dark: `dark:bg-card`

### Text Colors
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Card descriptions: `text-muted-foreground`

### Border & Shadows
- Border: `border-border`
- Ring (focus): `outline-ring/50`
- Shadow: `shadow-xs`

## 📱 Responsive Design

### Container Queries
Container queries allow components to respond to their container size, not viewport:

```tsx
@container/main  // Main content area
@container/card  // Individual cards
```

**Breakpoints**:
- `@xl/main`: ~768px (tablet)
- `@5xl/main`: ~1536px (large desktop)
- `@[250px]/card`: Card width 250px+
- `@[540px]/card`: Card width 540px+
- `@[767px]/card`: Card width 767px+

### Mobile-First Classes
```tsx
className="
  text-2xl                    // Mobile: 24px
  @[250px]/card:text-3xl      // 250px+: 30px
  sm:px-6                     // Small screens: 24px padding
  md:gap-6                    // Medium screens: 24px gap
  lg:px-6                     // Large screens: 24px padding
"
```

## 🎯 Common Patterns

### Section Spacing
```tsx
<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
  {/* Content */}
</div>
```

### Horizontal Padding
```tsx
<div className="px-4 lg:px-6">
  {/* Content */}
</div>
```

### Flex Layout
```tsx
<div className="flex flex-1 flex-col">
  {/* Takes full height with flex column */}
</div>
```

## 🔧 Customization Tips

### Changing Card Colors
Edit CSS variables in `globals.css`:
```css
:root {
  --chart-1: 12 76% 61%;  /* HSL format */
  --chart-2: 173 58% 39%;
}
```

### Adjusting Card Gradients
```tsx
className="*:data-[slot=card]:from-primary/5"  // Change opacity
className="*:data-[slot=card]:from-blue-500/10"  // Use specific color
```

### Card Height
```tsx
<ChartContainer className="aspect-auto h-[250px] w-full">
  {/* Change h-[250px] to desired height */}
</ChartContainer>
```

## 📋 Quick Reference

### Import Statements
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
```

### Reusable Components
```tsx
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
```

## ✨ Typography

All dashboard content uses **Geist Sans font** (Vercel's custom typeface) via the layout wrapper:
```tsx
// Applied automatically through dashboard layout
style={{ fontFamily: 'var(--font-geist-sans)' }}
```

Geist is a modern sans-serif typeface designed for optimal readability on digital screens, created by Vercel in collaboration with Basement Studio.

---

**Pro Tip**: Use `@container` queries for truly responsive components that adapt to their container, not the viewport!
