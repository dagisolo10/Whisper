"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function StartOver({ onResetFlow, disabled }: { onResetFlow: () => void; disabled: boolean }) {
    return (
        <Button type="button" variant="ghost" className="w-full text-sm text-zinc-400 hover:text-white" onClick={onResetFlow} disabled={disabled}>
            <RotateCcw className="size-4" />
            <p>Start over</p>
        </Button>
    );
}
