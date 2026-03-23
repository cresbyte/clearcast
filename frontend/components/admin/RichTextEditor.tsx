"use client";

import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-wysiwyg';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="min-h-[200px] border border-border bg-muted/20 animate-pulse" />;
    }

    return (
        <div className="w-full">
            <Editor
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                containerProps={{
                    style: {
                        resize: 'vertical',
                        minHeight: '250px',
                        borderRadius: '0',
                        borderColor: 'hsl(var(--border))',
                        backgroundColor: 'transparent'
                    }
                }}
            />
        </div>
    );
}
