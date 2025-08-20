import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Amazing Products</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Shop the latest trends with unbeatable prices and quality. Find everything you need in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
