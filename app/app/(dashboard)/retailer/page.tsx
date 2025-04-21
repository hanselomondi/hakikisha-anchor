"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CheckCircle, ClipboardCheck, Package, Shield, ShoppingBag, Tag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for received products
const mockReceived = [
  { id: "PRD004", name: "Aged Rum", manufacturer: "Acme Distillery", dateReceived: "2023-08-05", status: "Received" },
  {
    id: "PRD005",
    name: "Tequila Blanco",
    manufacturer: "Acme Distillery",
    dateReceived: "2023-09-12",
    status: "Pending",
  },
]

// Mock data for sold products
const mockSold = [
  { id: "PRD001", name: "Premium Vodka", saleDate: "2023-10-15" },
  { id: "PRD002", name: "Craft Gin", saleDate: "2023-10-22" },
]

export default function RetailerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isApproved, setIsApproved] = useState(true) // Toggle for demo
  const [activeTab, setActiveTab] = useState("received")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [productToSell, setProductToSell] = useState<string | null>(null)

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }

    // If authenticated but not a retailer, redirect to the appropriate dashboard
    if (status === "authenticated" && session) {
      const userRole = session.user?.role

      if (userRole !== "retailer") {
        if (userRole === "manufacturer") {
          router.push("/manufacturer")
        } else {
          router.push("/user")
        }
      }
    }
  }, [session, status, router])

  // If still loading, show a loading spinner
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleConfirmReceipt = () => {
    setIsLoading(true)
    // Simulate confirmation
    setTimeout(() => {
      setIsLoading(false)
      setIsConfirmDialogOpen(false)
      setSelectedProduct(null)
    }, 1500)
  }

  const handleMarkAsSold = () => {
    setIsLoading(true)
    // Simulate marking as sold
    setTimeout(() => {
      setIsLoading(false)
      setIsSellDialogOpen(false)
      setProductToSell(null)
    }, 1500)
  }

  const openConfirmDialog = (productId: string) => {
    setSelectedProduct(productId)
    setIsConfirmDialogOpen(true)
  }

  if (!isApproved) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{session?.user?.email || "User"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/api/auth/signout")}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-4">
          <div className="container max-w-4xl py-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>Your retailer account is pending approval from an admin.</CardDescription>
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
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{session?.user?.email || "5Gh7...9Kp2"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-white md:flex">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="font-semibold text-indigo-700">Retailer Dashboard</h2>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            <Button
              variant={activeTab === "received" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("received")}
            >
              <Package className="mr-2 h-4 w-4" />
              Received Products
            </Button>
            <Button
              variant={activeTab === "sold" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("sold")}
            >
              <Tag className="mr-2 h-4 w-4" />
              Sold Products
            </Button>
            <Button
              variant={activeTab === "sell" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("sell")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Mark as Sold
            </Button>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-1">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Verified Retailer</p>
                <p className="text-xs text-gray-500">City Liquor Store</p>
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
                  <TabsTrigger value="received">Received</TabsTrigger>
                  <TabsTrigger value="sold">Sold</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Received Products Tab */}
            {activeTab === "received" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Received Products</h1>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Date Received</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockReceived.map((product) => (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.manufacturer}</TableCell>
                            <TableCell>{product.dateReceived}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  product.status === "Received"
                                    ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                                    : "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                                }
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {product.status === "Pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openConfirmDialog(product.id)}
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm Receipt
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sold Products Tab */}
            {activeTab === "sold" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Sold Products</h1>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Sale Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSold.map((product) => (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.saleDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Mark as Sold Tab */}
            {activeTab === "sell" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Mark Product as Sold</h1>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Record a Sale</CardTitle>
                    <CardDescription>Select a product from your inventory to mark as sold</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Select onValueChange={setProductToSell}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockReceived
                              .filter((product) => product.status === "Received")
                              .map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.id} - {product.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => setIsSellDialogOpen(true)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!productToSell}
                        >
                          <Tag className="mr-2 h-4 w-4" />
                          Mark as Sold
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirm Receipt Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Product Receipt</DialogTitle>
            <DialogDescription>Confirm that you have received this product from the manufacturer.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-indigo-50 p-4 text-indigo-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-1">
                  <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">Confirm Product: {selectedProduct}</p>
                  <p className="text-sm text-indigo-600">This action will be recorded on the blockchain</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReceipt} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
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
                  Confirming...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Receipt
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Sold Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Product as Sold</DialogTitle>
            <DialogDescription>This will record the sale of this product on the blockchain.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-indigo-50 p-4 text-indigo-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-1">
                  <Tag className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">Mark as Sold: {productToSell}</p>
                  <p className="text-sm text-indigo-600">This action cannot be undone</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsSold} className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
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
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Confirm Sale
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
