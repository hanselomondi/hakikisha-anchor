"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Package, PackagePlus, Shield, ShoppingBag, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { signOut } from "next-auth/react"
import dynamic from "next/dynamic";
import UserNavBar from "@/components/UserNavBar"
const WalletButtonClient = dynamic(() => import("@/components/WalletMultiButton"), { ssr: false });


// Mock data for products
const mockProducts = [
  {
    id: "PRD001",
    name: "Premium Vodka",
    status: "Active",
    owner: "You",
    batchNumber: "BTC-2023-001",
    productionDate: "2023-05-15",
  },
  {
    id: "PRD002",
    name: "Craft Gin",
    status: "Active",
    owner: "You",
    batchNumber: "BTC-2023-002",
    productionDate: "2023-06-22",
  },
  {
    id: "PRD003",
    name: "Single Malt Whiskey",
    status: "Active",
    owner: "You",
    batchNumber: "BTC-2023-003",
    productionDate: "2023-07-10",
  },
]

// Mock data for transferred products
const mockTransferred = [
  { id: "PRD004", name: "Aged Rum", retailerWallet: "5Gh7...9Kp2", date: "2023-08-05" },
  { id: "PRD005", name: "Tequila Blanco", retailerWallet: "3Jk9...7Lm4", date: "2023-09-12" },
]

export default function ManufacturerDashboard() {
  const [isApproved, setIsApproved] = useState(false) // Toggle for demo
  const [activeTab, setActiveTab] = useState("register")
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [retailerWallet, setRetailerWallet] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [productForm, setProductForm] = useState({
    productId: "",
    batchNumber: "",
    productionDate: "",
    name: "",
    description: "",
  })

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate product registration
    setTimeout(() => {
      setIsLoading(false)
      setProductForm({
        productId: "",
        batchNumber: "",
        productionDate: "",
        name: "",
        description: "",
      })
      // Would add to products list in a real app
      setActiveTab("products")
    }, 1500)
  }

  const handleTransfer = () => {
    setIsLoading(true)
    // Simulate transfer
    setTimeout(() => {
      setIsLoading(false)
      setIsTransferDialogOpen(false)
      setRetailerWallet("")
      setSelectedProduct(null)
    }, 1500)
  }

  const openTransferDialog = (productId: string) => {
    setSelectedProduct(productId)
    setIsTransferDialogOpen(true)
  }

  if (!isApproved) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Navbar */}
        <UserNavBar />

        <main className="flex-1 bg-gray-50 p-4">
          <div className="container max-w-4xl py-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>Your manufacturer account is pending approval from an admin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-indigo-50 p-4 text-indigo-700">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-indigo-600"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Verification in progress</p>
                      <p className="text-sm text-indigo-600">You'll receive a notification once approved</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsApproved(true)} // For demo purposes
                    className="mt-4"
                  >
                    Demo: Show Approved Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet className="h-4 w-4" />
              <span>8Kvj...F3pZ</span>
            </div>
            <Button variant="ghost" size="sm">
              Disconnect
            </Button>
            <Button onClick={() => signOut({
              redirect: true,
              callbackUrl: `${window.location.origin}/sign-in`
            })} variant='destructive'>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-white md:flex">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="font-semibold text-indigo-700">Manufacturer Dashboard</h2>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            <Button
              variant={activeTab === "register" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("register")}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              Register Product
            </Button>
            <Button
              variant={activeTab === "products" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("products")}
            >
              <Package className="mr-2 h-4 w-4" />
              My Products
            </Button>
            <Button
              variant={activeTab === "transferred" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("transferred")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Transferred Products
            </Button>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-1">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Verified Manufacturer</p>
                <p className="text-xs text-gray-500">Acme Distillery</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-4">
          <div className="container py-4">
            {/* Mobile tabs */}
            <div className="mb-6 md:hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="transferred">Transferred</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Register Product Tab */}
            {activeTab === "register" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Register New Product</h1>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Register a new product on the Solana blockchain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegisterProduct} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="productId">Product ID</Label>
                          <Input
                            id="productId"
                            name="productId"
                            placeholder="Enter product ID"
                            value={productForm.productId}
                            onChange={handleProductFormChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batchNumber">Batch Number</Label>
                          <Input
                            id="batchNumber"
                            name="batchNumber"
                            placeholder="Enter batch number"
                            value={productForm.batchNumber}
                            onChange={handleProductFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter product name"
                            value={productForm.name}
                            onChange={handleProductFormChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productionDate">Production Date</Label>
                          <Input
                            id="productionDate"
                            name="productionDate"
                            type="date"
                            value={productForm.productionDate}
                            onChange={handleProductFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Enter product description"
                          value={productForm.description}
                          onChange={handleProductFormChange}
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                          {isLoading ? (
                            <div className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Registering...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <PackagePlus className="mr-2 h-4 w-4" />
                              Register Product
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* My Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                  <Button onClick={() => setActiveTab("register")} className="bg-indigo-600 hover:bg-indigo-700">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Register New
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Current Owner</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockProducts.map((product) => (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.owner}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => openTransferDialog(product.id)}>
                                Transfer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transferred Products Tab */}
            {activeTab === "transferred" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Transferred Products</h1>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Retailer Wallet</TableHead>
                          <TableHead>Transfer Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTransferred.map((product) => (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.retailerWallet}</TableCell>
                            <TableCell>{product.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Product</DialogTitle>
            <DialogDescription>Transfer this product to a retailer by entering their wallet address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID</Label>
              <Input id="productId" value={selectedProduct || ""} disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailerWallet">Retailer Wallet Address</Label>
              <Input
                id="retailerWallet"
                placeholder="Enter retailer's wallet address"
                value={retailerWallet}
                onChange={(e) => setRetailerWallet(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!retailerWallet || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Transferring...
                </div>
              ) : (
                <div className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Transfer Product
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
