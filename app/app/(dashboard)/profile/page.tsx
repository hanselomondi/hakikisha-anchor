"use client";

import { useState, useEffect } from "react";
import { Shield, Upload, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserNavBar from "@/components/UserNavBar";
import { useWallet } from "@solana/wallet-adapter-react";

export default function ProfilePage() {
  const [status, setStatus] = useState<"not_submitted" | "pending" | "approved" | "rejected">("not_submitted");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    licenseNumber: "",
    role: "manufacturer" as "manufacturer" | "retailer",
  });
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const router = useRouter();
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/user/registration-status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.status === "rejected") {
            // Fetch rejection reason from pendingRegistration
            const pendingRes = await fetch("/api/user/pending-registration");
            if (pendingRes.ok) {
              const pendingData = await pendingRes.json();
              setRejectionReason(pendingData.rejectionReason || "No reason provided");
            }
          }
          if (data.status === "approved") {
            router.push("/manufacturer");
          }
        } else {
          toast.error("Failed to fetch registration status");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Fetch status error:", error);
      }
    };
    fetchStatus();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!file) {
      toast.error("Please upload a license document");
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("businessName", formData.businessName);
    formDataToSend.append("licenseNumber", formData.licenseNumber);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("walletAddress", publicKey.toString());
    formDataToSend.append("file", file);

    try {
      const res = await fetch("/api/user/submit-registration", {
        method: "POST",
        body: formDataToSend,
      });
      if (res.ok) {
        toast.success("Profile submitted successfully");
        setStatus("pending");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to submit profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <UserNavBar />
      <main className="flex-1 bg-gray-50 p-4">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Verification</h1>
            <p className="mt-2 text-gray-600">
              Complete your profile information to get verified as a manufacturer or retailer.
            </p>
          </div>

          {status === "pending" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Verification Pending</CardTitle>
                <CardDescription>
                  Your profile has been submitted for verification. An admin will review your information shortly.
                </CardDescription>
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
                      <p className="text-sm text-indigo-600">You'll be notified once approved</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : status === "rejected" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Verification Rejected</CardTitle>
                <CardDescription>
                  Your profile submission was rejected. Please review the reason and resubmit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-1">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Rejection Reason</p>
                      <p className="text-sm text-red-600">{rejectionReason}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setStatus("not_submitted")}>
                    Resubmit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Provide your business details for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        placeholder="Enter your license number"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 p-2"
                      required
                    >
                      <option value="manufacturer">Manufacturer</option>
                      <option value="retailer">Retailer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      name="walletAddress"
                      value={publicKey ? publicKey.toString() : "Connect wallet first"}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">Connect your Solana wallet to proceed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">License Document</Label>
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-10 text-center">
                      {file ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 items-center gap-2 rounded bg-gray-100 px-3 py-2 text-sm">
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
                              className="h-4 w-4 text-indigo-600"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span className="flex-1 truncate">{file.name}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                            <Upload className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="document"
                              className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="document"
                                name="document"
                                type="file"
                                accept=".pdf"
                                className="sr-only"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isLoading || !formData.businessName || !formData.licenseNumber || !file || !publicKey}
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
                        "Submit for Verification"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}