"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    CheckCircle,
    ClipboardList,
    Eye,
    FileText,
    LogOut,
    Package,
    Search,
    Shield,
    ShoppingBag,
    Users,
    XCircle,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { signOut, useSession } from "next-auth/react"
import Loading from "@/components/Loading"

// types based on Prisma schema
interface PendingRegistration {
    id: number
    userId: string
    role: "manufacturer" | "retailer"
    businessName: string
    licenseNumber: string
    walletAddress: string
    documentUrl: string
    status: "pending" | "approved" | "rejected"
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
    user: {
        email: string
    }
}

interface ApprovedAccount {
    id: string
    email: string
    role: "manufacturer" | "retailer"
    businessName: string
    licenseNumber: string
    walletAddress: string
    verificationStatus: "approved"
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
}

export default function AdminDashboard() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending")
    const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
    const [approvedAccounts, setApprovedAccounts] = useState<ApprovedAccount[]>([])
    const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Check for admin authentication
    useEffect(() => {
        if (status === "loading") return // Do nothing while loading
        if (!session || !session.user.isAdmin) {
            router.push("/admin/login")
        }
    }, [session, status, router]);

    // Fetch data on mount and when activeTab changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (activeTab === "pending") {
                    const res = await fetch("/api/admin/pending-registrations");
                    if (!res.ok) {
                        toast.error("Failed to fetch pending registrations");
                        throw new Error("Failed to fetch pending registrations");
                    }
                    const data: PendingRegistration[] = await res.json();
                    setPendingRegistrations(Array.isArray(data) ? data : []);
                } else {
                    const res = await fetch("/api/admin/approved-accounts");
                    if (!res.ok) {
                        toast.error("Failed to fetch approved accounts");
                        throw new Error("Failed to fetch approved accounts");
                    }
                    const data: ApprovedAccount[] = await res.json();
                    setApprovedAccounts(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error fetching data");
                // Reset to empty arrays on error to prevent invalid state
                if (activeTab === "pending") {
                    setPendingRegistrations([]);
                } else {
                    setApprovedAccounts([]);
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [activeTab]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin/login" })
        toast.success("Logged out successfully")
    }

    const handleViewRegistration = (registration: PendingRegistration) => {
        setSelectedRegistration(registration)
        setIsViewDialogOpen(true)
    }

    const handleApproveRegistration = async () => {
        if (!selectedRegistration) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/approve-registration/${selectedRegistration.id}`, {
                method: "POST",
            })
            if (!res.ok) {
                toast.error("Failed to approve registration")
                throw new Error("Failed to approve registration")
            }
            toast.success(`${selectedRegistration.businessName} has been approved`)
            setIsApproveDialogOpen(false)
            setIsViewDialogOpen(false)
            setSelectedRegistration(null)
            // Refresh data
            const dataRes = await fetch("/api/admin/pending-registrations")
            if (dataRes.ok) {
                const data = await dataRes.json()
                setPendingRegistrations(data)
            }
        } catch (error) {
            console.error("Error approving registration:", error)
            toast.error("Error approving registration")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRejectRegistration = async () => {
        if (!selectedRegistration) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/reject-registration/${selectedRegistration.id}`, {
                method: "POST",
                body: JSON.stringify({ reason: rejectionReason }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!res.ok) {
                toast.error("Failed to reject registration")
                throw new Error("Failed to reject registration")
            }
            toast.success(`${selectedRegistration.businessName} has been rejected`)
            setIsRejectDialogOpen(false)
            setIsViewDialogOpen(false)
            setSelectedRegistration(null)
            setRejectionReason("")
            // Refresh pending registrations
            const dataRes = await fetch("/api/admin/pending-registrations")
            if (dataRes.ok) {
                setPendingRegistrations(await dataRes.json())
            }
        } catch (error) {
            console.error("Error rejecting registration:", error)
            toast.error("Error rejecting registration")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPendingRegistrations = pendingRegistrations.filter(
        (reg) =>
            reg.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const filteredApprovedAccounts = approvedAccounts.filter(
        (acc) =>
            acc.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="flex min-h-screen flex-col">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between px-5">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <span className="text-xl font-bold text-indigo-700">Hakikisha Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="hidden w-64 flex-col border-r bg-white md:flex fixed top-16 h-[calc(100vh-4rem)]">
                    <div className="flex h-14 items-center border-b px-4">
                        <h2 className="font-semibold text-indigo-700">Admin Dashboard</h2>
                    </div>
                    <nav className="flex-1 space-y-1 p-2 overflow-hidden">
                        <Button
                            variant={activeTab === "pending" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveTab("pending")}
                        >
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Pending Registrations
                        </Button>
                        <Button
                            variant={activeTab === "approved" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveTab("approved")}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Approved Accounts
                        </Button>
                    </nav>
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-indigo-100 p-1">
                                <Shield className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Admin Portal</p>
                                <p className="text-xs text-gray-500">Manage platform users</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 bg-gray-50 p-4 pt-24 md:ml-64">
                    <div className="container py-4">
                        {/* Mobile tabs */}
                        <div className="mb-6 md:hidden">
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "approved")}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="approved">Approved</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Dashboard header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab === "pending" ? "Pending Registrations" : "Approved Accounts"}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {activeTab === "pending"
                                    ? "Review and approve registration requests from manufacturers and retailers."
                                    : "View and manage approved manufacturer and retailer accounts."}
                            </p>
                        </div>

                        {/* Search bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    placeholder="Search by name, email, license number..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Stats cards */}
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Registrations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Loading />
                                    ) : (
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {pendingRegistrations.length + approvedAccounts.length}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">All time</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Loading />
                                    ) : (
                                        <div>
                                            <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
                                            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Approved Accounts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Loading />
                                    ) : (
                                        <div>
                                            <div className="text-2xl font-bold">{approvedAccounts.length}</div>
                                            <p className="text-xs text-gray-500 mt-1">Active on blockchain</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pending Registrations Tab */}
                        {activeTab === "pending" && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Registration Requests</CardTitle>
                                    <CardDescription>Review and approve new account requests</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {isLoading ? (
                                        <Loading />
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Business Name</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>License Number</TableHead>
                                                    <TableHead>Submission Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredPendingRegistrations.length > 0 ? (
                                                    filteredPendingRegistrations.map((registration) => (
                                                        <TableRow key={registration.id} className="hover:bg-gray-50">
                                                            <TableCell className="font-medium">{registration.businessName}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        registration.role === "manufacturer"
                                                                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                                                                            : "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                                                                    }
                                                                >
                                                                    {registration.role === "manufacturer" ? (
                                                                        <Package className="mr-1 h-3 w-3" />
                                                                    ) : (
                                                                        <ShoppingBag className="mr-1 h-3 w-3" />
                                                                    )}
                                                                    {registration.role.charAt(0).toUpperCase() + registration.role.slice(1)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{registration.licenseNumber}</TableCell>
                                                            <TableCell>{new Date(registration.createdAt).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewRegistration(registration)}
                                                                    className="mr-2"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center">
                                                            No pending registrations found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Approved Accounts Tab */}
                        {activeTab === "approved" && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Approved Accounts</CardTitle>
                                    <CardDescription>Manage existing manufacturer and retailer accounts</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {isLoading ? (
                                        <Loading />
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Business Name</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>License Number</TableHead>
                                                    <TableHead>Wallet Address</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Approval Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredApprovedAccounts.length > 0 ? (
                                                    filteredApprovedAccounts.map((account) => (
                                                        <TableRow key={account.id} className="hover:bg-gray-50">
                                                            <TableCell className="font-medium">{account.businessName}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        account.role === "manufacturer"
                                                                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                                                                            : "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                                                                    }
                                                                >
                                                                    {account.role === "manufacturer" ? (
                                                                        <Package className="mr-1 h-3 w-3" />
                                                                    ) : (
                                                                        <ShoppingBag className="mr-1 h-3 w-3" />
                                                                    )}
                                                                    {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{account.licenseNumber}</TableCell>
                                                            <TableCell>
                                                                <code className="rounded bg-gray-100 px-2 py-1 text-xs">{account.walletAddress}</code>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                                                                >
                                                                    Active
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{new Date(account.updatedAt).toLocaleDateString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center">
                                                            No approved accounts found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* View Registration Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registration Details</DialogTitle>
                        <DialogDescription>Review the registration information and uploaded documents.</DialogDescription>
                    </DialogHeader>
                    {selectedRegistration && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                                    <p className="mt-1">{selectedRegistration.businessName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                                    <p className="mt-1">
                                        <Badge
                                            variant="outline"
                                            className={
                                                selectedRegistration.role === "manufacturer"
                                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                                                    : "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                                            }
                                        >
                                            {selectedRegistration.role === "manufacturer" ? (
                                                <Package className="mr-1 h-3 w-3" />
                                            ) : (
                                                <ShoppingBag className="mr-1 h-3 w-3" />
                                            )}
                                            {selectedRegistration.role.charAt(0).toUpperCase() + selectedRegistration.role.slice(1)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1">{selectedRegistration.user.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                                    <p className="mt-1">{selectedRegistration.licenseNumber}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                                    <p className="mt-1">{new Date(selectedRegistration.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
                                    <p className="mt-1">{selectedRegistration.walletAddress}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Uploaded Document</h3>
                                <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-200 p-3">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    <span className="flex-1 truncate">License Document</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(selectedRegistration.documentUrl, "_blank")}
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsApproveDialogOpen(true)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Registration Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve Registration</DialogTitle>
                        <DialogDescription>
                            This will create an on-chain account for the applicant and notify them of the approval.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="rounded-lg bg-indigo-50 p-4 text-indigo-700">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-indigo-100 p-1">
                                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Confirm Approval</p>
                                    <p className="text-sm text-indigo-600">
                                        Approving {selectedRegistration?.businessName} as a {selectedRegistration?.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApproveRegistration}
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
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Approval
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Registration Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this registration. This will be sent to the applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="rounded-lg bg-red-50 p-4 text-red-700">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-1">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Confirm Rejection</p>
                                    <p className="text-sm text-red-600">
                                        Rejecting {selectedRegistration?.businessName} as a {selectedRegistration?.role}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Rejection Reason</h3>
                            <Textarea
                                placeholder="Please provide details on why this registration is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRejectRegistration}
                            variant="destructive"
                            disabled={isLoading || !rejectionReason.trim()}
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
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Confirm Rejection
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
