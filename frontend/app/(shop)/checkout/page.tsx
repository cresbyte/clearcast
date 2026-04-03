"use client";

import { createAddress, fetchAddresses } from "@/api/addressApi";
import { createOrder, fetchActiveGateways, verifyPaystackPayment, fetchOrderById } from "@/api/orderApi";
import AddressForm from "@/components/address/AddressForm";
import RouteGuard from "@/components/RouteGuard";
import OrderSummary from "@/components/shop/OrderSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import useCartStore from "@/stores/useCartStore";
import PaystackPop from "@paystack/inline-js";
import {
  Check,
  CreditCard,
  Lock,
  MapPin,
  ShoppingBag,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Checkout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getShipping, getTotal, clearCart, coupon } =
    useCartStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [activeGateways, setActiveGateways] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // M-Pesa payment fields
  const [phoneNumber, setPhoneNumber] = useState("");

  const initialAddressForm = {
    first_name: user?.first_name || user?.name || "",
    last_name: user?.last_name || "",
    street_line1: "",
    street_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    address_type: "S",
    default: false,
  };

  const [newAddressForm, setNewAddressForm] = useState(initialAddressForm);

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadGateways();
    }
  }, [user]);

  const loadGateways = async () => {
    try {
      const data = await fetchActiveGateways();
      const gatewayList = Array.isArray(data) ? data : data?.results || [];
      setActiveGateways(gatewayList);
      if (gatewayList.length > 0) {
        // No longer pre-selecting gateway
      }
    } catch (error) {
      console.error("Failed to fetch gateways:", error);
    }
  };

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await fetchAddresses();
      const addressList = Array.isArray(data) ? data : data?.results || [];
      setAddresses(addressList);

      if (addressList.length > 0) {
        // No longer pre-selecting address
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressFormChange = (updatedData: any) => {
    setNewAddressForm(updatedData);
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAddress = await createAddress(newAddressForm);
      toast.success("Address added successfully");
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressDialog(false);
      setNewAddressForm(initialAddressForm);
    } catch (error) {
      console.error("Failed to add address:", error);
      toast.error("Failed to add address. Please check your data.");
    }
  };

  const handleCancelAddressDialog = () => {
    setShowAddressDialog(false);
    setNewAddressForm(initialAddressForm);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping destination");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a settlement method");
      return;
    }

    if (!items || items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate payment method specific fields
    const isMpesa = paymentMethod === "mpesa" || paymentMethod === "m-pesa";
    if (isMpesa) {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Build order payload
      const orderPayload: any = {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        items: items.map((item: any) => ({
          product_id: item.productId,
          variant_id: item.variantId || null,
          quantity: item.quantity,
        })),
        coupon_code: coupon?.code,
      };

      // Add payment-specific fields
      if (isMpesa) {
        orderPayload.phone_number = phoneNumber;
      }

      const order = await createOrder(orderPayload);

      // Handle Redirect-based payments (e.g. PayPal)
      if (order.is_redirect && order.payment_url) {
        toast.info("Establishing payment connection...");
        window.location.href = order.payment_url;
        return;
      }

      // Handle Paystack Inline JS-based payments
      if (order.is_paystack_inline) {
        const paystackInstance = new PaystackPop();
        paystackInstance.resumeTransaction(order.paystack_access_code, {
          onSuccess: async () => {
            toast.info("Verifying payment...");
            try {
              await verifyPaystackPayment(order.paystack_reference);
              clearCart();
              toast.success("Payment successful and verified!");
              router.push(`/profile/orders/${order.id}`);
            } catch (err) {
              console.error("Verification failed:", err);
              toast.error("Payment verification failed. Your order is pending resolution.");
              router.push(`/profile/orders/${order.id}`);
            }
          },
          onCancel: () => {
            toast.info("Payment window closed. Your order is pending.");
            router.push(`/profile/orders/${order.id}`);
          },
          onError: () => {
            toast.error("Payment failed. Please try again.");
            router.push(`/profile/orders/${order.id}`);
          }
        });
        return;
      }

      // Handle STK Push-based payments (e.g. M-Pesa)
      if (order.is_stk) {
        setPaymentStatus("STK Push triggered. Check your phone.");

        // Start polling for payment status
        let attempts = 0;
        const maxAttempts = 30; // 30 * 4s = 120s timeout

        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            setPaymentStatus(`Verifying payment... (${attempts}/${maxAttempts})`);
            const orderStatus = await fetchOrderById(order.id);

            // Backend status mapping: 'P' (Pending), 'A' (Paid), 'C' (Cancelled/Failed), 'F' (Failed)
            if (orderStatus.status === 'A') {
              clearInterval(pollInterval);
              setPaymentStatus(null);
              clearCart();
              toast.success("M-Pesa payment successful!");
              router.push(`/profile/orders/${order.id}`);
            } else if (orderStatus.status === 'C' || orderStatus.status === 'F') {
              clearInterval(pollInterval);
              setPaymentStatus(null);
              toast.error("M-Pesa payment failed or was cancelled.");
              setIsProcessing(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setPaymentStatus(null);
              toast.error("Payment verification timed out. Please check your order status later.");
              router.push(`/profile/orders/${order.id}`);
            }
          } catch (error) {
            console.error("Polling error:", error);
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setPaymentStatus(null);
              toast.error("Failed to verify payment status.");
              router.push(`/profile/orders/${order.id}`);
            }
          }
        }, 4000);

        return;
      }

      // Clear cart after successful order (simulation/direct)
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/profile/orders/${order.id}`);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      const errorMessage =
        error.response?.data?.payment ||
        error.response?.data?.detail ||
        error.response?.data?.items?.[0] ||
        "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const shippingAddresses = addresses;

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-8 max-w-md">
          <div className="flex justify-center">
            <div className="h-32 w-32 bg-[#F9F9F7] flex items-center justify-center border border-secondary/20 relative">
              <ShoppingBag className="h-12 w-12 text-secondary/20" />
              <div className="absolute -inset-4 border border-secondary/10 -z-10" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-bold tracking-tight">Checkout Occupied</h2>
            <p className="text-muted-foreground text-sm font-serif italic">Your selection is currently empty. Please return to our collection to proceed.</p>
          </div>
          <Link href="/shop">
            <Button className="h-14 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-none bg-secondary text-white hover:bg-secondary/90 transition-all duration-500">
              Return to Curation
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard requireAuth>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
            {/* Checkout Form */}
            <div className="lg:col-span-7 space-y-16">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/60">Finalization</span>
                <h1 className="text-5xl font-serif font-bold tracking-tighter">Acquisition</h1>
              </div>

              {/* Contact Info */}
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                  <span className="flex-none h-8 w-8 bg-secondary text-white text-[11px] flex items-center justify-center font-black">01</span>
                  <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-secondary">Contact Information</h2>
                </div>
                <div className="pl-12 space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/40">Registered Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      className="h-12 border-none bg-[#F9F9F7] text-[12px] font-bold tracking-wide rounded-none focus-visible:ring-1 focus-visible:ring-black transition-all"
                      disabled
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-border/40" />

              {/* Shipping Address */}
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex-none h-8 w-8 bg-secondary text-white text-[11px] flex items-center justify-center font-black">02</span>
                    <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-secondary">Shipping Destination</h2>
                  </div>
                  <button
                    onClick={() => {
                      setNewAddressForm(initialAddressForm);
                      setShowAddressDialog(true);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                  >
                    Add New Destination
                  </button>
                </div>

                <div className="pl-12">
                  {loadingAddresses ? (
                    <div className="py-10 flex gap-4 overflow-x-auto">
                      {[1, 2].map((i) => <div key={i} className="h-40 w-64 bg-[#F9F9F7] animate-pulse" />)}
                    </div>
                  ) : shippingAddresses.length === 0 ? (
                    <div
                      onClick={() => setShowAddressDialog(true)}
                      className="group border border-dashed border-border p-12 text-center cursor-pointer hover:border-black transition-all bg-white"
                    >
                      <MapPin className="h-8 w-8 mx-auto mb-4 text-muted-foreground/20 group-hover:text-black transition-colors" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-black transition-colors">Manifest New Address</p>
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedAddress?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const addr = addresses.find(
                          (a: any) => a.id.toString() === value,
                        );
                        setSelectedAddress(addr);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {shippingAddresses.map((addr: any) => (
                        <div key={addr.id} className="relative h-full">
                          <RadioGroupItem
                            value={addr.id.toString()}
                            id={`address-${addr.id}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`address-${addr.id}`}
                            className={`flex flex-col h-full p-6 border transition-all duration-500 cursor-pointer ${selectedAddress?.id === addr.id
                              ? "border-secondary bg-secondary/5"
                              : "border-border/60 bg-white hover:border-secondary/30"
                              }`}
                          >
                            <div className="flex-1 space-y-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="text-[11px] font-black uppercase tracking-widest">
                                    {addr.first_name} {addr.last_name}
                                  </p>
                                  {addr.default && (
                                    <span className={`text-[8px] font-black tracking-[0.2em] uppercase ${selectedAddress?.id === addr.id ? '/60' : 'text-muted-foreground/40'}`}>
                                      Primary
                                    </span>
                                  )}
                                </div>
                                {selectedAddress?.id === addr.id && (
                                  <div className="h-5 w-5 bg-secondary flex items-center justify-center rounded-full">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className={`text-[12px] font-medium leading-relaxed font-serif italic ${selectedAddress?.id === addr.id ? '/80' : 'text-muted-foreground/60'}`}>
                                <p>{addr.street_line1}</p>
                                {addr.street_line2 && <p>{addr.street_line2}</p>}
                                <p>{addr.city}, {addr.state_province} {addr.postal_code}</p>
                                <p className="not-italic font-bold uppercase tracking-widest text-[10px] pt-1">{addr.country}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </section>

              <Separator className="bg-border/40" />

              {/* Payment */}
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-4">
                  <span className="flex-none h-8 w-8 bg-secondary text-white text-[11px] flex items-center justify-center font-black">03</span>
                  <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-secondary">Settlement Method</h2>
                </div>

                <div className="pl-12 space-y-8">
                  <RadioGroup
                    value={paymentMethod || ""}
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {activeGateways.map((gw) => (
                      <div key={gw.id} className="relative">
                        <RadioGroupItem value={gw.name.toLowerCase()} id={gw.name} className="peer sr-only" />
                        <Label
                          htmlFor={gw.name}
                          className={`flex flex-col items-center justify-center gap-3 p-6 border cursor-pointer transition-all duration-500 ${paymentMethod === gw.name.toLowerCase() ? "border-secondary bg-secondary/5" : "border-border/60 hover:border-secondary/30"
                            }`}
                        >
                          {(gw.name.toLowerCase() === 'mpesa' || gw.name.toLowerCase() === 'm-pesa') ? (
                            <Smartphone className={`h-5 w-5 ${(paymentMethod === 'mpesa' || paymentMethod === 'm-pesa') ? "" : "text-muted-foreground/40"}`} />
                          ) : (
                            <CreditCard className={`h-5 w-5 ${paymentMethod === gw.name.toLowerCase() ? "" : "text-muted-foreground/40"}`} />
                          )}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === gw.name.toLowerCase() ? "text-secondary" : ""}`}>{gw.name}</span>
                        </Label>
                      </div>
                    ))}
                    {activeGateways.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/40 italic">No settlement methods manifested.</p>
                    )}
                  </RadioGroup>

                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">

                    {(paymentMethod === "mpesa" || paymentMethod === "m-pesa") && (
                      <div className="grid gap-6 p-10 bg-[#F9F9F7] max-w-xl">
                        <div className="space-y-2">
                          <Label htmlFor="phone-number" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">M-Pesa Telephone</Label>
                          <Input
                            id="phone-number"
                            placeholder="+254 --- --- ---"
                            className="h-12 border-none bg-white text-[12px] font-bold tracking-[0.2em] rounded-none focus-visible:ring-1 focus-visible:ring-secondary"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                          <p className="text-[9px] font-medium text-muted-foreground/40 italic pt-2">An STK authentication portal will manifest on your device.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-t border-border/40 pt-10">
                    <Lock className="h-4 w-4 text-secondary/30" />
                    <span>Secure Encrypted Protocols Active</span>
                  </div>
                </div>
              </section>

              <div className="pt-8">
                <Link href="/shop">
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-secondary transition-all border-b border-transparent hover:border-secondary pb-1">
                    ← Revisit Selection
                  </button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 lg:pl-12">
              <OrderSummary
                actionLabel="Verify Acquisition"
                onAction={handlePlaceOrder}
                isProcessing={isProcessing}
                processingMessage={paymentStatus}
                className="checkout-summary"
              />
            </div>
          </div>
        </div>

        {/* Add Address Dialog */}
        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
          <DialogContent className="max-w-4xl bg-white rounded-none border-none p-0 shadow-2xl">
            <div className="p-8 md:p-4 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold tracking-tight">Manifest Address</h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">Define a new sanctuary for your acquisitions</p>
                <div className="w-12 h-[1px] bg-secondary" />
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <AddressForm
                  formData={newAddressForm}
                  onChange={handleAddressFormChange}
                  onSubmit={handleAddNewAddress}
                  onCancel={handleCancelAddressDialog}
                  isSubmitting={false}
                  isEditing={false}
                  showAddressType={false}
                  showNames={true}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
};

export default Checkout;
