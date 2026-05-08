"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RefObject } from "react";
import { PendingImage } from "@/types/media";

interface ImageOptionsProp {
    activeIndex: number;
    closePreview: () => void;
    pendingImages: PendingImage[];
    removePendingImage: (id: string) => void;
    imageInputRef: RefObject<HTMLInputElement | null>;
}

export default function ImageOptions({ imageInputRef, pendingImages, activeIndex, removePendingImage, closePreview }: ImageOptionsProp) {
    return (
        <>
            <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                <Plus className="size-4" />
                Add more
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                    const currentId = pendingImages[activeIndex]?.id;
                    if (!currentId) return;
                    removePendingImage(currentId);
                    if (pendingImages.length === 1) closePreview();
                }}
            >
                Remove
            </Button>
        </>
    );
}
