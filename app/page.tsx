import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { ProductSearch } from "@/components/product-search"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"

export default function HomePage() {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <div className="space-y-6">
              <ProductSearch />
              <CategoryFilter />
            </div>
          </aside>

          <div className="flex-1">
            <ProductGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
