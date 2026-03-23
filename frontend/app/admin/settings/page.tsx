"use client";

import {
    createPaymentGateway,
    deletePaymentGateway,
    fetchAllGateways,
    updatePaymentGateway
} from "@/api/orderApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Settings2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PaymentSettingsPage = () => {
    const [gateways, setGateways] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newGateway, setNewGateway] = useState({ name: "", is_active: false, config: {} });
    const [newConfigKey, setNewConfigKey] = useState("");

    useEffect(() => {
        fetchGateways();
    }, []);

    const fetchGateways = async () => {
        setLoading(true);
        try {
            const data = await fetchAllGateways();
            setGateways(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Failed to fetch gateways:", error);
            toast.error("Failed to load payment gateways");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: number, currentStatus: boolean) => {
        setSaving(id.toString());
        try {
            await updatePaymentGateway(id, { is_active: !currentStatus });
            toast.success("Gateway status updated");
            fetchGateways();
        } catch (error) {
            console.error("Error toggling gateway:", error);
            toast.error("Error updating gateway");
        } finally {
            setSaving(null);
        }
    };

    const handleConfigChange = (id: number, key: string, value: string) => {
        setGateways(prev => prev.map(g => {
            if (g.id === id) {
                return {
                    ...g,
                    config: { ...g.config, [key]: value }
                };
            }
            return g;
        }));
    };

    const handleSaveConfig = async (gateway: any) => {
        setSaving(`config-${gateway.id}`);
        try {
            await updatePaymentGateway(gateway.id, { config: gateway.config });
            toast.success(`${gateway.name} configuration saved`);
        } catch (error) {
            console.error("Error saving config:", error);
            toast.error("Error saving configuration");
        } finally {
            setSaving(null);
        }
    };

    const handleAddGateway = async () => {
        if (!newGateway.name) {
            toast.error("Gateway name is required");
            return;
        }
        setSaving("adding");
        try {
            await createPaymentGateway(newGateway);
            toast.success("Gateway created successfully");
            setIsAddDialogOpen(false);
            setNewGateway({ name: "", is_active: false, config: {} });
            fetchGateways();
        } catch (error) {
            console.error("Error adding gateway:", error);
            toast.error("Failed to create gateway");
        } finally {
            setSaving(null);
        }
    };

    const handleDeleteGateway = async (id: number) => {
        if (!confirm("Are you sure you want to delete this gateway?")) return;
        setSaving(`delete-${id}`);
        try {
            await deletePaymentGateway(id);
            toast.success("Gateway deleted");
            fetchGateways();
        } catch (error) {
            console.error("Error deleting gateway:", error);
            toast.error("Failed to delete gateway");
        } finally {
            setSaving(null);
        }
    };

    const addConfigField = (gatewayId: number | null = null) => {
        if (!newConfigKey) return;

        if (gatewayId === null) {
            setNewGateway(prev => ({
                ...prev,
                config: { ...prev.config, [newConfigKey]: "" }
            }));
        } else {
            setGateways(prev => prev.map(g => {
                if (g.id === gatewayId) {
                    return {
                        ...g,
                        config: { ...g.config, [newConfigKey]: "" }
                    };
                }
                return g;
            }));
        }
        setNewConfigKey("");
    };

    const removeConfigField = (key: string, gatewayId: number | null = null) => {
        if (gatewayId === null) {
            const newConfig = { ...newGateway.config };
            delete (newConfig as any)[key];
            setNewGateway(prev => ({ ...prev, config: newConfig }));
        } else {
            setGateways(prev => prev.map(g => {
                if (g.id === gatewayId) {
                    const newConfig = { ...g.config };
                    delete (newConfig as any)[key];
                    return { ...g, config: newConfig };
                }
                return g;
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground text-sm">Manifest and manage acquisition settlement protocols.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger className="inline-flex justify-center items-center h-11 px-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-none bg-black text-white hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" />
                        Manifest Gateway
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-white rounded-none border-none shadow-2xl">
                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-3xl font-serif font-bold tracking-tight">New Protocol</DialogTitle>
                            <DialogDescription className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/40">
                                Define a new settlement interface for the ecosystem.
                            </DialogDescription>
                            <div className="w-12 h-[1px] bg-black" />
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">Gateway Name</Label>
                                <Input
                                    placeholder="e.g. Stripe, PayPal"
                                    value={newGateway.name}
                                    onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                                    className="bg-[#F9F9F7] border-none h-11 text-[12px] font-bold tracking-wide rounded-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">Configuration Keys</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Key name"
                                            value={newConfigKey}
                                            onChange={(e) => setNewConfigKey(e.target.value)}
                                            className="h-8 text-[10px] w-32 rounded-none border-border/40"
                                            onKeyPress={(e) => e.key === 'Enter' && addConfigField()}
                                        />
                                        <Button variant="outline" size="sm" onClick={() => addConfigField()} className="h-8 w-8 p-0 rounded-none border-border/40">
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                    {Object.keys(newGateway.config).map((key) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <div className="flex-1 text-[11px] font-bold bg-[#F9F9F7] px-3 py-2">{key.replace(/_/g, ' ')}</div>
                                            <Button variant="ghost" size="sm" onClick={() => removeConfigField(key)} className="h-8 w-8 p-0 text-red-500">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAddGateway}
                                disabled={saving === 'adding'}
                                className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-none bg-black text-white hover:bg-zinc-800"
                            >
                                {saving === 'adding' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate Manifestation"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {gateways.map((gateway) => (
                    <Card key={gateway.id} className="overflow-hidden border-none shadow-sm bg-[#F9F9F7]">
                        <CardHeader className="border-b bg-white/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-serif">{gateway.name}</CardTitle>
                                    <CardDescription className="text-[10px] uppercase tracking-widest font-black">
                                        Settlement Interface
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${gateway.is_active ? 'text-green-600' : 'text-muted-foreground/40'}`}>
                                        {gateway.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <Switch
                                        checked={gateway.is_active}
                                        onCheckedChange={() => handleToggle(gateway.id, gateway.is_active)}
                                        disabled={saving === gateway.id.toString()}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 max-w-2xl">
                                {Object.keys(gateway.config || {}).map((key) => (
                                    <div key={key} className="space-y-2 relative group">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                                                {key.replace(/_/g, ' ')}
                                            </Label>
                                            <button
                                                onClick={() => removeConfigField(key, gateway.id)}
                                                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <Input
                                            value={gateway.config[key] || ''}
                                            onChange={(e) => handleConfigChange(gateway.id, key, e.target.value)}
                                            className="bg-white border-none h-11 text-[12px] font-bold tracking-wide rounded-none focus-visible:ring-1 focus-visible:ring-black"
                                        //type={key.includes('secret') || key.includes('key') ? 'password' : 'text'}
                                        />
                                    </div>
                                ))}
                                {(!gateway.config || Object.keys(gateway.config).length === 0) && (
                                    <p className="text-[11px] italic text-muted-foreground/60">No configuration required or manifested.</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-white/30 pt-4 pb-4 flex justify-between gap-4">
                            <Button
                                onClick={() => handleSaveConfig(gateway)}
                                disabled={saving === `config-${gateway.id}`}
                                className="h-10 px-8 text-[10px] font-black uppercase tracking-[0.2em] rounded-none bg-black text-white hover:bg-zinc-800"
                            >
                                {saving === `config-${gateway.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Commit Configuration
                            </Button>

                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <Input
                                        placeholder="Add field key..."
                                        value={newConfigKey}
                                        onChange={(e) => setNewConfigKey(e.target.value)}
                                        className="h-10 text-[10px] w-32 rounded-none border-border/40 bg-white"
                                        onKeyPress={(e) => e.key === 'Enter' && addConfigField(gateway.id)}
                                    />
                                    <Button variant="outline" onClick={() => addConfigField(gateway.id)} className="h-10 w-10 p-0 rounded-none border-border/40 bg-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDeleteGateway(gateway.id)}
                                    disabled={saving === `delete-${gateway.id}`}
                                    className="h-10 w-10 p-0 rounded-none border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                                >
                                    {saving === `delete-${gateway.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {gateways.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-border/60">
                        <Settings2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground font-serif italic">No payment gateways manifested in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSettingsPage;
