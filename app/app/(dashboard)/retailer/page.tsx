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
import { toast } from "sonner";
import UserNavBar from "@/components/UserNavBar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useWallet } from "@solana/wallet-adapter-react"
import { SolanaService } from "@/lib/solanaService"

interface ReceivedProduct {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  dateReceived: string;
  status: "Received" | "Pending";
}

interface SoldProduct {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  saleDate: string;
}

interface Manufacturer {
  id: string;
  businessName: string;
}

export default function RetailerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isApproved, setIsApproved] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const [receivedProducts, setReceivedProducts] = useState<ReceivedProduct[]>([]);
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([]); // Will be updated later
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToSell, setProductToSell] = useState<string | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [requestForm, setRequestForm] = useState({
    manufacturerId: "",
    productName: "",
    quantity: ""
  });
  const { publicKey, wallet } = useWallet();

  // Fetch verification status and products
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated" && session) {
      const userRole = session.user?.role;

      if (userRole !== "retailer") {
        if (userRole === "manufacturer") {
          router.push("/manufacturer");
        } else {
          router.push("/user");
        }
        return;
      }

      // Fetch verification status
      const fetchStatus = async () => {
        try {
          const res = await fetch("/api/user/registration-status");
          if (res.ok) {
            const data = await res.json();
            setIsApproved(data.status === "approved");
          } else {
            console.error("Failed to fetch registration status");
            toast.error("Failed to fetch registration status");
          }
        } catch (error) {
          toast.error("An error occurred while fetching registration status");
          console.error("Error fetching registration status:", error);
        }
      };

      // Fetch received products
      const fetchReceivedProducts = async () => {
        try {
          const res = await fetch("/api/retailer/received-products");
          if (res.ok) {
            const data = await res.json();
            setReceivedProducts(data);
          } else {
            console.error("Failed to fetch received products");
            toast.error("Failed to fetch received products");
          }
        } catch (error) {
          toast.error("An error occurred while fetching received products");
          console.error("Error fetching received products:", error);
        }
      };

      // Fetch manufacturers
      const fetchManufacturers = async () => {
        try {
          const res = await fetch("/api/manufacturers");
          if (res.ok) {
            const data = await res.json();
            setManufacturers(data);
          } else {
            console.error("Failed to fetch manufacturers");
            toast.error("Failed to fetch manufacturers");
          }
        } catch (error) {
          toast.error("An unexpected error occurred");
          console.error("Error fetching manufacturers:", error);
        }
      };

      const fetchSoldProducts = async () => {
        try {
          const res = await fetch("/api/retailer/sold-products");
          if (res.ok) {
            const data = await res.json();
            setSoldProducts(data);
          } else {
            toast.error("Failed to fetch sold products");
          }
        } catch (error) {
          toast.error("An unexpected error occurred");
          console.error("Fetch sold products error: ", error);
        }
      }

      fetchStatus();
      fetchReceivedProducts();
      fetchManufacturers();
      fetchSoldProducts();
    }
  }, [session, status, router]);

  // If still loading, show a loading spinner
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleConfirmReceipt = async () => {
    if (!selectedProduct) {
      toast.error("No product selected");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/retailer/confirm-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: selectedProduct }),
      });

      if (res.ok) {
        toast.success("Receipt confirmed successfully");
        setIsConfirmDialogOpen(false);
        setSelectedProduct(null);
        // Refresh received products
        const productsRes = await fetch("/api/retailer/received-products");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setReceivedProducts(data);
        } else {
          console.error("Failed to fetch received products");
          toast.error("Failed to fetch received products");
        }
      } else {
        const error = await res.json();
        console.error(`Failed to confirm receipt: ${error.message}`);
        toast.error(`Failed to confirm receipt: ${error.message}`);
      }
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error("An error occurred while confirming receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!publicKey || !wallet || !wallet.adapter) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!productToSell) {
      toast.error("No product selected to mark as sold");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Marking product as sold on-chain...");
      const solanaService = new SolanaService(wallet.adapter);
      const tx = await solanaService.markAsSold(productToSell);
      toast.success("Product marked as sold on-chain successfully");
      console.log("Mark as sold transaction:", tx);

      // Update RDBMS
      toast.info("Updating database...");
      const res = await fetch("/api/retailer/mark-as-sold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: productToSell }),
      });

      if (res.ok) {
        toast.success("Product marked as sold successfully");
        setIsSellDialogOpen(false);
        setProductToSell(null);
        // Refresh received and sold products
        const receivedRes = await fetch("/api/retailer/received-products");
        if (receivedRes.ok) {
          const data = await receivedRes.json();
          setReceivedProducts(data);
        } else {
          toast.error("Failed to refresh received products");
        }

        const soldRes = await fetch("/api/retailer/sold-products");
        if (soldRes.ok) {
          const data = await soldRes.json();
          setSoldProducts(data);
        } else {
          toast.error("Failed to refresh sold products");
        }
      } else {
        const error = await res.json();
        toast.error(`Failed to update database: ${error.message}`);
      }
    } catch (error: any) {
      toast.error(`Failed to mark product as sold on-chain: ${error.message || "Unknown error"}`);
      console.error("Mark as sold error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRequestProduct = async () => {
    if (!requestForm.manufacturerId || !requestForm.productName || !requestForm.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(requestForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/retailer/request-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manufacturerId: requestForm.manufacturerId,
          productName: requestForm.productName,
          quantity,
        }),
      });

      if (res.ok) {
        toast.success("Product request submitted successfully");
        setRequestForm({
          manufacturerId: "",
          productName: "",
          quantity: ""
        });
      } else {
        const error = await res.json();
        console.error(`Failed to submit product request: ${error.message}`);
        toast.error(`Failed to submit product request: ${error.message}`);
      }
    } catch (error) {
      toast.error("Failed to submit product request");
      console.error("Error submitting product request:", error);
    } finally {
      setIsLoading(false);
    }
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
      <UserNavBar />

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
              variant={activeTab === "request" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("request")}
            >
              <Package className="mr-2 h-4 w-4" />
              Request Product
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
                  <TabsTrigger value="request">Request</TabsTrigger>
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
                          <TableHead>Description</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Date Received</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receivedProducts.length > 0 ? (
                          receivedProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{product.id}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.description}</TableCell>
                              <TableCell>{product.manufacturer}</TableCell>
                              <TableCell>{new Date(product.dateReceived).toLocaleDateString()}</TableCell>
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No received products found.
                            </TableCell>
                          </TableRow>
                        )}
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
                          <TableHead>Description</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Sale Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {soldProducts.length > 0 ? (
                          soldProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{product.id}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.description}</TableCell>
                              <TableCell>{product.manufacturer}</TableCell>
                              <TableCell>{new Date(product.saleDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                              No sold products found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Request Product Tab */}
            {activeTab === "request" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Request Product</h1>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Request a Product</CardTitle>
                    <CardDescription>Submit a request for a product from a manufacturer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Select
                          onValueChange={(value) =>
                            setRequestForm((prev) => ({ ...prev, manufacturerId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a manufacturer" />
                          </SelectTrigger>
                          <SelectContent>
                            {manufacturers.map((manufacturer) => (
                              <SelectItem key={manufacturer.id} value={manufacturer.id}>
                                {manufacturer.businessName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          placeholder="Enter product name"
                          value={requestForm.productName}
                          onChange={(e) =>
                            setRequestForm((prev) => ({ ...prev, productName: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="Enter quantity"
                          value={requestForm.quantity}
                          onChange={(e) =>
                            setRequestForm((prev) => ({ ...prev, quantity: e.target.value }))
                          }
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleRequestProduct}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={isLoading}
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
                              Submitting...
                            </div>
                          ) : (
                            "Submit Request"
                          )}
                        </Button>
                      </div>
                    </div>
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
                            {receivedProducts
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
