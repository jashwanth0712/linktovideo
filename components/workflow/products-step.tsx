"use client"

import { useState } from "react"
import { PlusIcon, TrashIcon } from "@/lib/icons"

interface Product {
  id: string
  name: string
  description: string
  image: string
}

interface ProductsStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ProductsStep({ data, onUpdate }: ProductsStepProps) {
  const [products, setProducts] = useState<Product[]>(
    data.products || [
      {
        id: "1",
        name: "Product 1",
        description: "Premium quality product",
        image: `/placeholder.svg?height=80&width=80&query=product`,
      },
      {
        id: "2",
        name: "Product 2",
        description: "Best seller in the category",
        image: `/placeholder.svg?height=80&width=80&query=product`,
      },
      {
        id: "3",
        name: "Product 3",
        description: "Customer favorite",
        image: `/placeholder.svg?height=80&width=80&query=product`,
      },
    ],
  )

  const handleUpdateProduct = (id: string, field: string, value: string) => {
    const updated = products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    setProducts(updated)
    onUpdate({ ...data, products: updated })
  }

  const handleRemoveProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id)
    setProducts(updated)
    onUpdate({ ...data, products: updated })
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "New Product",
      description: "Product description",
      image: `/placeholder.svg?height=80&width=80&query=product`,
    }
    const updated = [...products, newProduct]
    setProducts(updated)
    onUpdate({ ...data, products: updated })
  }

  return (
    <div className="space-y-6">
      {/* Website Info */}
      <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
        {data.logo && (
          <img
            src={data.logo || "/placeholder.svg"}
            alt="Logo"
            className="w-16 h-16 rounded-lg bg-background object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.productCount} products found</p>
        </div>
      </div>

      {/* Products List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground">Products & Offerings</h4>
          <span className="text-xs text-muted-foreground">{products.length} items</span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div key={product.id} className="flex gap-3 p-3 bg-muted rounded-lg">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-20 h-20 rounded bg-background object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)}
                  className="w-full px-2 py-1 bg-background border border-border rounded text-sm font-medium text-foreground mb-2"
                />
                <textarea
                  value={product.description}
                  onChange={(e) => handleUpdateProduct(product.id, "description", e.target.value)}
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs text-foreground resize-none h-10"
                  placeholder="Product description"
                />
              </div>

              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive flex-shrink-0"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Button */}
      <button
        onClick={handleAddProduct}
        className="w-full py-3 border-2 border-dashed border-border hover:border-foreground/30 rounded-lg text-foreground transition-colors flex items-center justify-center gap-2"
      >
        <PlusIcon size={18} />
        Add Product
      </button>
    </div>
  )
}
