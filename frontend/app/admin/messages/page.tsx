"use client";

import React from 'react';
import { useContactMessages } from '@/api/contactApi';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Trash2, ExternalLink, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminMessagesPage() {
    const { data: messages, isLoading, error, refetch } = useContactMessages();

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <p className="text-destructive">Failed to load messages.</p>
                <Button onClick={() => refetch()} variant="outline" className="rounded-none">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/30 p-6 border border-border/50">
                <div>
                    <h1 className="text-3xl font-bold font-serif italic">Contact Messages</h1>
                    <p className="text-muted-foreground mt-1">Manage inquiries from your customers.</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
            </div>

            <Card className="rounded-none border-border/50 shadow-md">
                <CardHeader className="border-b">
                    <CardTitle className="text-lg font-serif">Inbox</CardTitle>
                    <CardDescription className="text-xs italic">
                        Showing {messages?.results?.length || 0} recent messages
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold w-[20%]">Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold w-[20%]">From</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold w-[40%]">Subject</TableHead>
                                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold w-[20%]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages?.results?.length > 0 ? (
                                messages.results.map((msg: any) => (
                                    <TableRow key={msg.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(msg.created_at), 'MMM dd, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{msg.name}</span>
                                                <span className="text-[10px] text-muted-foreground italic">{msg.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm truncate max-w-md">{msg.subject}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-none hover:bg-primary/5">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl rounded-none border-primary/20">
                                                    <DialogHeader className="border-b pb-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <DialogTitle className="text-2xl font-serif italic">{msg.subject}</DialogTitle>
                                                                <DialogDescription className="text-xs uppercase tracking-widest font-bold mt-1">
                                                                    From: {msg.name} ({msg.email})
                                                                </DialogDescription>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                                {format(new Date(msg.created_at), 'PPPP p')}
                                                            </div>
                                                        </div>
                                                    </DialogHeader>
                                                    <div className="py-6 space-y-4">
                                                        {msg.phone_number && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground shrink-0">Phone:</span>
                                                                <span>{msg.phone_number}</span>
                                                            </div>
                                                        )}
                                                        <div className="bg-muted/30 p-6 border-l-4 border-primary italic text-sm leading-relaxed whitespace-pre-wrap">
                                                            {msg.message}
                                                        </div>
                                                        {msg.attachment && (
                                                            <div className="pt-4 border-t border-border/20">
                                                                <span className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground block mb-2">Attachment:</span>
                                                                <a 
                                                                    href={msg.attachment} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                                                                >
                                                                    <Paperclip className="h-4 w-4" />
                                                                    View / Download Attachment
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                        No messages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
