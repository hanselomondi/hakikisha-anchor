"use client"

import { useState, useEffect } from "react"
import { Package, PackagePlus, ShoppingBag, User, Wallet } from "lucide-react"
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
import { signOut, useSession } from "next-auth/react"
import dynamic from "next/dynamic";
import UserNavBar from "@/components/UserNavBar"
import { toast } from "sonner"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { SolanaService } from "@/lib/solanaService"
import { PublicKey } from "@solana/web3.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
const WalletButtonClient = dynamic(() => import("@/components/WalletMultiButton"), { ssr: false });

interface Product {
  id: string;
  productId: string;
  batchNumber: string;
  name: string;
  description: string;
  productionDate: string;
  status: "active" | "transferred";
  owner: string;
  blockchainAccount: string;
}

interface TransferredProduct {
  id: string;
  productId: string;
  name: string;
  retailerWallet: string;
  transferDate: string;
}

interface Retailer {
  id: string;
  businessName: string;
  walletAddress: string;
}

interface ProductRequest {
  id: string;
  productName: string;
  quantity: string;
  retailer: string;
  retailerEmail: string;
  requestDate: string;
}

export default function ManufacturerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { publicKey, wallet, connected } = useWallet();
  const [verificationStatus, setVerificationStatus] = useState<"not_submitted" | "pending" | "approved" | "rejected" | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<"register" | "products" | "transferred" | "requests">("register");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [transferredProducts, setTransferredProducts] = useState<TransferredProduct[]>([]);
  const [productForm, setProductForm] = useState({
    productId: "",
    batchNumber: "" as string, // String for input, parse to number
    productionDate: "",
    name: "",
    description: "",
  });
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedRetailerId, setSelectedRetailerId] = useState<string>("");

  // Check authentication and verification status
  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (session.user.role !== "manufacturer") {
      toast.error("Access denied: You are not a manufacturer.");
      router.push("/profile");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/user/registration-status");
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data.status);
        } else {
          toast.error("Failed to fetch registration status");
          console.error("Failed to fetch registration status");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch status error:", error);
      }
    };
    fetchStatus();
  }, [session, status, router]);

  // Handle redirection if not approved
  useEffect(() => {
    if (verificationStatus && verificationStatus !== "approved") {
      setIsRedirecting(true);
      router.push("/profile");
    }
  }, [verificationStatus, router]);

  // Fetch products and transferred products
  useEffect(() => {
    if (verificationStatus !== "approved") return;

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/manufacturer/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          toast.error("Failed to fetch products");
          console.error("Failed to fetch products");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch products error:", error);
      }
    };

    const fetchTransferredProducts = async () => {
      try {
        const res = await fetch("/api/manufacturer/transferred-products");
        if (res.ok) {
          const data = await res.json();
          setTransferredProducts(data);
        } else {
          toast.error("Failed to fetch transferred products");
          console.error("Failed to fetch transferred products");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch transferred products error:", error);
      }
    };

    const fetchRetailers = async () => {
      try {
        const res = await fetch("/api/retailers");
        if (res.ok) {
          const data = await res.json();
          setRetailers(data);
        } else {
          toast.error("Failed to fetch retailers");
          console.error("Failed to fetch retailers");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch retailers error:", error);
      }
    }

    const fetchProductRequests = async () => {
      try {
        const res = await fetch("/api/manufacturer/product-requests");
        if (res.ok) {
          const data = await res.json();
          setProductRequests(data);
        } else {
          toast.error("Failed to fetch product requests");
          console.error("Failed to fetch product requests");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch product requests error:", error);
      }
    }

    fetchProducts();
    fetchTransferredProducts();
    fetchRetailers();
    fetchProductRequests();
  }, [verificationStatus]);

  // Handle product form changes
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: name === "batchNumber" ? value : value,
    }));
  }

  // Register a new product
  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !wallet || !connected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validate and convert batchNumber to number
    const batchNumber = parseInt(productForm.batchNumber, 10);
    if (isNaN(batchNumber) || batchNumber < 0) {
      toast.error("Please enter a valid batch number");
      return;
    }

    // Convert productionDate to Unix timestamp (seconds)
    const productionDate = Math.floor(new Date(productForm.productionDate).getTime() / 1000);
    if (isNaN(productionDate)) {
      toast.error("Please enter a valid production date");
      return;
    }

    setIsLoading(true)
    try {
      console.log("Wallet:", wallet);
      const solanaService = new SolanaService(wallet.adapter);
      const { tx, productAccount } = await solanaService.registerProduct(
        productForm.productId,
        batchNumber,
        productionDate,
        productForm.name,
        productForm.description
      );

      console.log("On-chain registration successful. Transaction:", tx, "Product Account:", productAccount);
      toast.success("Product registered on-chain successfully");
      console.log("Product registration transaction:", tx);
      // Save product in RDBMS
      const res = await fetch("/api/manufacturer/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productForm.productId,
          batchNumber: productForm.batchNumber,
          name: productForm.name,
          description: productForm.description,
          productionDate: productionDate.toString(),  // Send as Unix timestamp (string)
          blockchainAccount: productAccount,
        }),
      });

      console.log("API Response Status:", res.status, "OK:", res.ok);

      if (res.ok) {
        toast.success("Product registered successfully");
        setProductForm({
          productId: "",
          batchNumber: "",
          productionDate: "",
          name: "",
          description: "",
        });
        setActiveTab("products");
        // Refresh products
        const productsRes = await fetch("/api/manufacturer/products");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
      } else {
        const error = await res.json();
        toast.error(`Failed to register product: ${error.message}`);
      }
    } catch (error) {
      toast.error("Failed to register product on-chain");
      console.error("Register product error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open transfer dialog
  const openTransferDialog = (product: Product) => {
    if (product.status === "transferred") {
      toast.error("Product has already been transferred");
      return;
    }
    setSelectedProduct(product);
    setIsTransferDialogOpen(true);
  };

  const handleTransfer = async () => {
    if (!publicKey || !wallet) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!selectedProduct) {
      toast.error("No product selected for transfer");
      return;
    }
    if (!selectedRetailerId) {
      toast.error("Please select a retailer");
      return;
    }

    const selectedRetailer = retailers.find((retailer) => retailer.id === selectedRetailerId);
    if (!selectedRetailer) {
      toast.error("Selected retailer not found");
      return;
    }

    const retailerWalletAddress = selectedRetailer.walletAddress;

    // Validate retailer wallet address
    try {
      new PublicKey(retailerWalletAddress);
    } catch (error) {
      toast.error("Invalid retailer wallet address");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Wallet: ", wallet);
      toast.info("Transferring product on-chain...");
      const solanaService = new SolanaService(wallet.adapter);
      const tx = await solanaService.transferProduct(
        selectedProduct.productId,
        retailerWalletAddress
      );
      toast.success("Product transferred on-chain successfully");
      console.log("Product transfer transaction:", tx);
      // Update product status in RDBMS
      toast.info("Updating product status in database...");
      const res = await fetch("/api/manufacturer/transfer-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          retailerWallet: retailerWalletAddress
        }),
      });

      if (res.ok) {
        toast.success("Product transferred successfully");
        setIsTransferDialogOpen(false);
        setSelectedRetailerId("");
        setSelectedProduct(null);
        // Refresh products
        const productsRes = await fetch("/api/manufacturer/products");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
        const transferredRes = await fetch("/api/manufacturer/transferred-products");
        if (transferredRes.ok) {
          const data = await transferredRes.json();
          setTransferredProducts(data);
        }
      } else {
        const error = await res.json();
        toast.error(`Failed to update database: ${error.message}`);
        console.error("Database update error:", error);
      }
    } catch (error) {
      toast.error("Failed to transfer product on-chain");
      console.error("Transfer product error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <UserNavBar />
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
            <Button
              variant={activeTab === "requests" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("requests")}
            >
              <Package className="mr-2 h-4 w-4" />
              Product Requests
            </Button>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-1">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Verified Manufacturer</p>
                <p className="text-xs text-gray-500">{session?.user.role || "Loading..."}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-4">
          <div className="container max-w-6xl py-4">
            {/* Mobile tabs */}
            <div className="mb-6 md:hidden">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "register" | "products" | "transferred")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="transferred">Transferred</TabsTrigger>
                  <TabsTrigger value="requests">Requests</TabsTrigger>
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
                            type="number"
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
                        <Button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={isLoading || !publicKey}
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
                              Registering...
                            </div>
                          ) : (
                            "Register Product"
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
                <h1 className="mb-6 text-2xl font-bold text-gray-900">My Products</h1>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Registered Products</CardTitle>
                    <CardDescription>View and manage your registered products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {products.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No products registered yet.</p>
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("register")}
                          className="mt-2 text-indigo-600"
                        >
                          Register a new product
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Batch Number</TableHead>
                            <TableHead>Production Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.productId}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.batchNumber}</TableCell>
                              <TableCell>
                                {new Date(parseInt(product.productionDate, 10) * 1000).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {product.status === "active" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openTransferDialog(product)}
                                  >
                                    Transfer
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Transferred Products Tab */}
            {activeTab === "transferred" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Transferred Products</h1>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Transferred Products</CardTitle>
                    <CardDescription>View products transferred to retailers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transferredProducts.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No products transferred yet.</p>
                      </div>
                    ) : (
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
                          {transferredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.productId}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                {`${product.retailerWallet.slice(0, 4)}...${product.retailerWallet.slice(-4)}`}
                              </TableCell>
                              <TableCell>
                                {new Date(product.transferDate).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Product Requests Tab */}
            {activeTab === "requests" && (
              <div>
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Product Requests</h1>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Retailer</TableHead>
                          <TableHead>Retailer Email</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productRequests.length > 0 ? (
                          productRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-50">
                              <TableCell>{request.productName}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{request.retailer}</TableCell>
                              <TableCell>{request.retailerEmail}</TableCell>
                              <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Manufacturer can proceed to register and transfer the product
                                    toast.info("Proceed to register and transfer the product to fulfill this request.");
                                  }}
                                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                  Fulfill Request
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No pending product requests.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Transfer Product Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Product</DialogTitle>
            <DialogDescription>
              Transfer {selectedProduct?.name} to a retailer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retailer">Select Retailer</Label>
              <Select onValueChange={setSelectedRetailerId} value={selectedRetailerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a retailer" />
                </SelectTrigger>
                <SelectContent>
                  {retailers.map((retailer) => (
                    <SelectItem key={retailer.id} value={retailer.id}>
                      {retailer.businessName} ({retailer.walletAddress.slice(0, 4)}...{retailer.walletAddress.slice(-4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTransferDialogOpen(false);
                setSelectedRetailerId("");
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading || !selectedRetailerId}
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
                "Transfer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}