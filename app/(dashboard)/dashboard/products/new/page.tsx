// =============================================================================
// File: src/app/(dashboard)/dashboard/products/new/page.tsx
// Description: Create new product page. Renders the ProductForm in "create" mode.
//              After saving, redirects to the edit page for variant management.
// =============================================================================

"use client"

import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 lg:px-6">
      <ProductForm mode="create" />
    </div>
  )
}
