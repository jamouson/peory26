import { CartProvider } from "@/components/cart"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}