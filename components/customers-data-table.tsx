// =============================================================================
// File: src/components/customers-data-table.tsx
// Description: Admin customers data table with TanStack React Table, search,
//   status filter, bulk actions, and create/edit sheet (right side drawer).
//   Pattern matches products-data-table.tsx for consistency.
// =============================================================================

"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader2,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const addressSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  label: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const schema = z.object({
  id: z.string(),
  clerk_user_id: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  admin_notes: z.string().nullable(),
  tags: z.array(z.string()),
  social_media: z.record(z.string(), z.string()).nullable(),
  is_active: z.boolean(),
  total_orders: z.number(),
  total_spent: z.number(),
  created_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  customer_addresses: z.array(addressSchema),
})

type Customer = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Social Media Platforms
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "@handle" },
  { key: "tiktok", label: "TikTok", placeholder: "@handle" },
  { key: "facebook", label: "Facebook", placeholder: "username or URL" },
  { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
  { key: "youtube", label: "YouTube", placeholder: "channel URL" },
  { key: "snapchat", label: "Snapchat", placeholder: "@handle" },
  { key: "pinterest", label: "Pinterest", placeholder: "username or URL" },
  { key: "linkedin", label: "LinkedIn", placeholder: "profile URL" },
]

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="outline" className="text-green-600 dark:text-green-400">
      <IconCircleCheckFilled className="mr-1 size-3" />
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Actions Menu
// ---------------------------------------------------------------------------

function ActionsMenu({
  customer,
  onEdit,
  onRefresh,
}: {
  customer: Customer
  onEdit: () => void
  onRefresh: () => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          is_active: !customer.is_active,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }
      toast.success(
        customer.is_active ? "Customer deactivated" : "Customer activated"
      )
      await onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }
      toast.success("Customer deleted")
      await onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleActive}>
          {customer.is_active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive focus:text-destructive"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function getColumns(
  onEditCustomer: (customer: Customer) => void,
  onRefresh: () => Promise<void>
): ColumnDef<Customer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Customer",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      cell: ({ row }) => {
        const customer = row.original
        return (
          <button
            className="flex flex-col text-left"
            onClick={() => onEditCustomer(customer)}
          >
            <span className="font-medium">
              {customer.first_name} {customer.last_name}
            </span>
            <span className="text-muted-foreground text-xs">
              {customer.email}
            </span>
          </button>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.company || "—"}
        </span>
      ),
    },
    {
      accessorKey: "total_orders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.total_orders}</span>
      ),
    },
    {
      accessorKey: "total_spent",
      header: "Spent",
      cell: ({ row }) => (
        <span className="text-sm">
          ${Number(row.original.total_spent).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <CustomerStatusBadge isActive={row.original.is_active} />
      ),
      filterFn: (row, _id, filterValue) => {
        if (filterValue === "all") return true
        if (filterValue === "active") return row.original.is_active
        if (filterValue === "inactive") return !row.original.is_active
        return true
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsMenu
          customer={row.original}
          onEdit={() => onEditCustomer(row.original)}
          onRefresh={onRefresh}
        />
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Customer Sheet (create/edit + addresses) — slides from right
// ---------------------------------------------------------------------------

function CustomerSheet({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSuccess: () => Promise<void>
}) {
  const isEdit = !!customer
  const [saving, setSaving] = React.useState(false)

  // Form state
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [adminNotes, setAdminNotes] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)

  // Social media
  const [socialEntries, setSocialEntries] = React.useState<
    { key: string; value: string }[]
  >([])

  // Address state (edit mode — multiple addresses)
  const [addresses, setAddresses] = React.useState<
    z.infer<typeof addressSchema>[]
  >([])
  const [showAddressForm, setShowAddressForm] = React.useState(false)
  const [editingAddress, setEditingAddress] = React.useState<
    z.infer<typeof addressSchema> | null
  >(null)

  // Address state (create mode — single initial address)
  const [addrLabel, setAddrLabel] = React.useState("Home")
  const [addrLine1, setAddrLine1] = React.useState("")
  const [addrLine2, setAddrLine2] = React.useState("")
  const [addrCity, setAddrCity] = React.useState("")
  const [addrState, setAddrState] = React.useState("")
  const [addrZip, setAddrZip] = React.useState("")
  const [addrCountry, setAddrCountry] = React.useState("US")
  const [addrPhone, setAddrPhone] = React.useState("")

  // Reset form when customer changes
  React.useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name)
      setLastName(customer.last_name)
      setEmail(customer.email)
      setPhone(customer.phone || "")
      setCompany(customer.company || "")
      setAdminNotes(customer.admin_notes || "")
      setIsActive(customer.is_active)
      setAddresses(customer.customer_addresses || [])
      // Social media
      const sm = customer.social_media || {}
      setSocialEntries(
        Object.entries(sm)
          .filter(([, v]) => v)
          .map(([key, value]) => ({ key, value: String(value) }))
      )
    } else {
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setCompany("")
      setAdminNotes("")
      setIsActive(true)
      setAddresses([])
      // Social media
      setSocialEntries([])
      // Reset create-mode address fields
      setAddrLabel("Home")
      setAddrLine1("")
      setAddrLine2("")
      setAddrCity("")
      setAddrState("")
      setAddrZip("")
      setAddrCountry("US")
      setAddrPhone("")
    }
    setShowAddressForm(false)
    setEditingAddress(null)
  }, [customer, open])

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("First name, last name, and email are required")
      return
    }

    setSaving(true)
    try {
      const socialMedia: Record<string, string> = {}
      for (const entry of socialEntries) {
        if (entry.value.trim()) socialMedia[entry.key] = entry.value.trim()
      }

      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        company: company || null,
        admin_notes: adminNotes || null,
        tags: customer?.tags || [],
        social_media: Object.keys(socialMedia).length > 0 ? socialMedia : null,
        is_active: isActive,
      }

      const url = isEdit
        ? `/api/admin/customers/${customer.id}`
        : "/api/admin/customers"

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      const resData = await res.json()

      // If creating and address fields are filled, attach the address
      if (!isEdit && addrLine1.trim()) {
        const newCustomerId = resData.customer.id
        const addrRes = await fetch(
          `/api/admin/customers/${newCustomerId}/addresses`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: addrLabel,
              first_name: firstName,
              last_name: lastName,
              address_line1: addrLine1,
              address_line2: addrLine2 || null,
              city: addrCity,
              state: addrState,
              zip: addrZip,
              country: addrCountry || "US",
              phone: addrPhone || null,
              is_default: true,
            }),
          }
        )
        if (!addrRes.ok) {
          toast.warning("Customer created, but address failed to save")
        }
      }

      toast.success(isEdit ? "Customer updated" : "Customer created")
      await onSuccess()
      if (!isEdit) onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? `${customer.first_name} ${customer.last_name}`
              : "New Customer"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Edit customer details and manage addresses"
              : "Create a new customer record"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 px-4 pb-4">
            {/* ── Contact Info ───────────────────────────── */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </div>

            {/* ── Social Media ─────────────────────────── */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Social Media</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={socialEntries.length >= SOCIAL_PLATFORMS.length}
                    >
                      <IconPlus className="mr-1 size-3" />
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {SOCIAL_PLATFORMS.filter(
                      (p) => !socialEntries.some((e) => e.key === p.key)
                    ).map((p) => (
                      <DropdownMenuItem
                        key={p.key}
                        onClick={() =>
                          setSocialEntries((prev) => [
                            ...prev,
                            { key: p.key, value: "" },
                          ])
                        }
                      >
                        {p.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {socialEntries.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  No social accounts added
                </p>
              )}
              {socialEntries.map((entry) => {
                const platform = SOCIAL_PLATFORMS.find(
                  (p) => p.key === entry.key
                )!
                return (
                  <div key={entry.key} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs font-medium">
                      {platform.label}
                    </span>
                    <Input
                      value={entry.value}
                      onChange={(e) =>
                        setSocialEntries((prev) =>
                          prev.map((s) =>
                            s.key === entry.key
                              ? { ...s, value: e.target.value }
                              : s
                          )
                        )
                      }
                      placeholder={platform.placeholder}
                      className="h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-7 shrink-0"
                      onClick={() =>
                        setSocialEntries((prev) =>
                          prev.filter((s) => s.key !== entry.key)
                        )
                      }
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* ── Status (edit only) ──────────────────────── */}
            {isEdit && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Status</Label>
                    <p className="text-muted-foreground text-xs">
                      Inactive customers cannot place orders
                    </p>
                  </div>
                  <Select
                    value={isActive ? "active" : "inactive"}
                    onValueChange={(v) => setIsActive(v === "active")}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* ── Address (create mode — inline fields) ──── */}
            {!isEdit && (
              <>
                <Separator />
                <div>
                  <Label className="mb-3 block">
                    Address{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <div className="space-y-3">
                    <Select value={addrLabel} onValueChange={setAddrLabel}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Address line 1"
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      className="h-8"
                    />
                    <Input
                      placeholder="Address line 2"
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="h-8"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="h-8"
                      />
                      <Input
                        placeholder="State"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="h-8"
                      />
                      <Input
                        placeholder="ZIP"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Country"
                        value={addrCountry}
                        onChange={(e) => setAddrCountry(e.target.value)}
                        className="h-8"
                      />
                      <Input
                        placeholder="Phone"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Addresses (edit mode — full management) ── */}
            {isEdit && (
              <>
                <Separator />
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Label>Saved Addresses</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAddress(null)
                        setShowAddressForm(true)
                      }}
                    >
                      <IconPlus className="mr-1 size-3" />
                      Add
                    </Button>
                  </div>
                  {addresses.length === 0 && !showAddressForm && (
                    <p className="text-muted-foreground text-sm">
                      No saved addresses
                    </p>
                  )}
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        customerId={customer.id}
                        onEdit={() => {
                          setEditingAddress(addr)
                          setShowAddressForm(true)
                        }}
                        onRefresh={async () => {
                          const res = await fetch(
                            `/api/admin/customers/${customer.id}/addresses`
                          )
                          if (res.ok) {
                            const json = await res.json()
                            setAddresses(json.addresses)
                          }
                          await onSuccess()
                        }}
                      />
                    ))}
                  </div>
                  {showAddressForm && (
                    <AddressForm
                      customerId={customer.id}
                      address={editingAddress}
                      onCancel={() => {
                        setShowAddressForm(false)
                        setEditingAddress(null)
                      }}
                      onSaved={async () => {
                        setShowAddressForm(false)
                        setEditingAddress(null)
                        const res = await fetch(
                          `/api/admin/customers/${customer.id}/addresses`
                        )
                        if (res.ok) {
                          const json = await res.json()
                          setAddresses(json.addresses)
                        }
                        await onSuccess()
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {/* ── Admin Notes ────────────────────────────── */}
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this customer..."
                rows={3}
              />
            </div>

            {/* ── Summary (edit only) ────────────────────── */}
            {isEdit && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-muted-foreground text-xs">Orders</p>
                    <p className="text-lg font-semibold">
                      {customer.total_orders}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Total Spent
                    </p>
                    <p className="text-lg font-semibold">
                      ${Number(customer.total_spent).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Addresses</p>
                    <p className="text-lg font-semibold">
                      {addresses.length}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <SheetFooter className="px-4 pb-4">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Address Card
// ---------------------------------------------------------------------------

function AddressCard({
  address,
  customerId,
  onEdit,
  onRefresh,
}: {
  address: z.infer<typeof addressSchema>
  customerId: string
  onEdit: () => void
  onRefresh: () => Promise<void>
}) {
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/customers/${customerId}/addresses/${address.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Address deleted")
      await onRefresh()
    } catch {
      toast.error("Failed to delete address")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-muted/50 flex items-start justify-between rounded-lg border p-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{address.label}</span>
          {address.is_default && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              Default
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {address.first_name} {address.last_name}
        </p>
        <p className="text-muted-foreground text-xs">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
        </p>
        <p className="text-muted-foreground text-xs">
          {address.city}, {address.state} {address.zip}
        </p>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onEdit}
        >
          <IconMapPin className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive size-7"
          onClick={handleDelete}
          disabled={deleting}
        >
          <IconTrash className="size-3" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Address Form
// ---------------------------------------------------------------------------

function AddressForm({
  customerId,
  address,
  onCancel,
  onSaved,
}: {
  customerId: string
  address: z.infer<typeof addressSchema> | null
  onCancel: () => void
  onSaved: () => Promise<void>
}) {
  const isEdit = !!address
  const [saving, setSaving] = React.useState(false)

  const [label, setLabel] = React.useState(address?.label || "Home")
  const [firstName, setFirstName] = React.useState(
    address?.first_name || ""
  )
  const [lastName, setLastName] = React.useState(address?.last_name || "")
  const [line1, setLine1] = React.useState(address?.address_line1 || "")
  const [line2, setLine2] = React.useState(address?.address_line2 || "")
  const [city, setCity] = React.useState(address?.city || "")
  const [state, setState] = React.useState(address?.state || "")
  const [zip, setZip] = React.useState(address?.zip || "")
  const [country, setCountry] = React.useState(address?.country || "US")
  const [addrPhone, setAddrPhone] = React.useState(address?.phone || "")
  const [isDefault, setIsDefault] = React.useState(
    address?.is_default || false
  )

  const handleSaveAddress = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !line1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zip.trim()
    ) {
      toast.error("Please fill in all required address fields")
      return
    }

    setSaving(true)
    try {
      const payload = {
        label,
        first_name: firstName,
        last_name: lastName,
        address_line1: line1,
        address_line2: line2 || null,
        city,
        state,
        zip,
        country,
        phone: addrPhone || null,
        is_default: isDefault,
      }

      const url = isEdit
        ? `/api/admin/customers/${customerId}/addresses/${address.id}`
        : `/api/admin/customers/${customerId}/addresses`

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save address")
      }

      toast.success(isEdit ? "Address updated" : "Address added")
      await onSaved()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save address"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {isEdit ? "Edit Address" : "New Address"}
        </Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="isDefault"
            checked={isDefault}
            onCheckedChange={(v) => setIsDefault(!!v)}
          />
          <Label htmlFor="isDefault" className="text-xs">
            Default
          </Label>
        </div>
      </div>
      <Select value={label} onValueChange={setLabel}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Home">Home</SelectItem>
          <SelectItem value="Work">Work</SelectItem>
          <SelectItem value="Billing">Billing</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="First name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-8"
        />
        <Input
          placeholder="Last name *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="h-8"
        />
      </div>
      <Input
        placeholder="Address line 1 *"
        value={line1}
        onChange={(e) => setLine1(e.target.value)}
        className="h-8"
      />
      <Input
        placeholder="Address line 2"
        value={line2}
        onChange={(e) => setLine2(e.target.value)}
        className="h-8"
      />
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="City *"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-8"
        />
        <Input
          placeholder="State *"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-8"
        />
        <Input
          placeholder="ZIP *"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="h-8"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-8"
        />
        <Input
          placeholder="Phone"
          value={addrPhone}
          onChange={(e) => setAddrPhone(e.target.value)}
          className="h-8"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSaveAddress} disabled={saving}>
          {saving && <IconLoader2 className="mr-1 size-3 animate-spin" />}
          {isEdit ? "Update" : "Add Address"}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Data Table Component
// ---------------------------------------------------------------------------

export function CustomersDataTable({
  data,
  onRefresh,
}: {
  data: Customer[]
  onRefresh: () => Promise<void>
}) {
  // Sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingCustomer, setEditingCustomer] =
    React.useState<Customer | null>(null)
  const [searchExpanded, setSearchExpanded] = React.useState(false)
  const isMobile = useIsMobile()
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      phone: !isMobile,
      company: !isMobile,
      total_spent: !isMobile,
    })
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Update visibility when mobile changes
  React.useEffect(() => {
    setColumnVisibility((prev) => ({
      ...prev,
      phone: !isMobile,
      company: !isMobile,
      total_spent: !isMobile,
    }))
  }, [isMobile])

  const columns = React.useMemo(
    () =>
      getColumns(
        (customer) => {
          setEditingCustomer(customer)
          setSheetOpen(true)
        },
        onRefresh
      ),
    [onRefresh]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const c = row.original
      return (
        c.first_name.toLowerCase().includes(search) ||
        c.last_name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.phone?.toLowerCase().includes(search) ?? false) ||
        (c.company?.toLowerCase().includes(search) ?? false)
      )
    },
  })

  // Bulk delete
  const handleBulkDelete = async () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id)

    if (selectedIds.length === 0) return

    try {
      const res = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }
      toast.success(`Deleted ${selectedIds.length} customer(s)`)
      setRowSelection({})
      await onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  // Expand search on mobile
  React.useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchExpanded])

  // Keep editingCustomer in sync with refreshed data
  React.useEffect(() => {
    if (editingCustomer) {
      const updated = data.find((c) => c.id === editingCustomer.id)
      if (updated) setEditingCustomer(updated)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tabs defaultValue="all" className="w-full flex-col gap-4">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Left: Tab selector */}
        {!(isMobile && searchExpanded) && (
          <>
            <Label htmlFor="view-selector" className="sr-only">
              View
            </Label>
            <Select defaultValue="all">
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
              <TabsTrigger value="all">
                All Customers{" "}
                <Badge variant="secondary">{data.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </>
        )}

        {/* Right: Actions — or expanded search on mobile */}
        {isMobile && searchExpanded ? (
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                placeholder="Search customers..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full pl-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchExpanded(false)
                    setGlobalFilter("")
                  }
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchExpanded(false)
                setGlobalFilter("")
              }}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Search — icon on mobile, input on desktop */}
            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchExpanded(true)}
              >
                <IconSearch className="size-4" />
              </Button>
            ) : (
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
                <Input
                  placeholder="Search customers..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-8 w-44 pl-8"
                />
              </div>
            )}

            {/* Status filter */}
            <Select
              defaultValue="all"
              onValueChange={(v) =>
                table.getColumn("is_active")?.setFilterValue(v)
              }
            >
              <SelectTrigger className="h-8 w-auto sm:w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="size-4" />
                  <span className="ml-1 hidden lg:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "is_active"
                        ? "Status"
                        : column.id === "name"
                          ? "Customer"
                          : column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCustomer(null)
                setSheetOpen(true)
              }}
            >
              <IconPlus className="size-4" />
              <span className="ml-1 hidden lg:inline">Add Customer</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ─────────────────────────────── */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 px-4 lg:px-6">
          <span className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <IconTrash className="mr-1 size-3" />
            Delete
          </Button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────── */}
      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {globalFilter
                      ? "No customers match your search."
                      : "No customers yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ─────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* ── Sheet (right side) ────────────────────────────── */}
      <CustomerSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customer={editingCustomer}
        onSuccess={onRefresh}
      />
    </Tabs>
  )
}