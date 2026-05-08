import { Button } from "./ui/button";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { GalleryImage } from "@/types/media";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface ImageCarouselProps {
    initialIndex?: number;
    galleryImages: GalleryImage[];
    children: ReactNode | ((controls: { openPreview: (index?: number) => void }) => ReactNode);
    renderActions?: (controls: { activeIndex: number; closePreview: () => void }) => ReactNode;
}

export function ImageCarousel({ galleryImages, initialIndex = 0, children, renderActions }: ImageCarouselProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [api, setApi] = useState<CarouselApi>();
    const [fullscreen, setFullscreen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    const maxIndex = Math.max(galleryImages.length - 1, 0);

    const openPreview = useCallback(
        (index = initialIndex) => {
            const nextIndex = Math.min(Math.max(index, 0), maxIndex);
            setActiveIndex(nextIndex);
            setIsOpen(true);
            api?.scrollTo(nextIndex, true);
        },
        [api, initialIndex, maxIndex],
    );

    const closePreview = useCallback(() => {
        setIsOpen(false);
    }, []);

    const onThumbClick = useCallback(
        (index: number) => {
            if (!api) return;
            api.scrollTo(index);
        },
        [api],
    );

    const trigger =
        typeof children === "function" ? (
            children({ openPreview })
        ) : (
            <button type="button" className="cursor-pointer" onClick={() => openPreview()}>
                {children}
            </button>
        );

    useEffect(() => {
        if (!api) return;

        const onselect = () => {
            setActiveIndex(api.selectedScrollSnap());
        };
        api.on("select", onselect);

        api.scrollTo(initialIndex, true);

        return () => {
            api.off("select", onselect);
        };
    }, [api, initialIndex]);

    if (galleryImages.length === 0) return trigger;

    const carouselHeight = fullscreen ? "h-[90vh]" : galleryImages.length === 1 ? "h-[80vh]" : "h-[60vh]";

    return (
        <>
            {trigger}

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 text-white" role="dialog" aria-modal="true">
                    <div className="flex h-full flex-col">
                        {!fullscreen && (
                            <div className="flex items-center justify-between p-4 sm:px-6">
                                <div />
                                <div className="text-muted-foreground py-2 text-center text-xs font-medium">
                                    Slide {activeIndex + 1} of {galleryImages.length}
                                </div>
                                {renderActions?.({ activeIndex, closePreview })}
                                <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={closePreview}>
                                    <X className="size-5" />
                                </Button>
                            </div>
                        )}

                        <div className="relative m-auto flex w-full max-w-11/12 flex-1 items-center justify-center">
                            <Button variant="ghost" size="icon" className="absolute left-4 z-10 hidden rounded-full sm:flex" onClick={() => api?.scrollPrev()} disabled={!api?.canScrollPrev()}>
                                <ChevronLeft className="size-5" />
                            </Button>

                            <Carousel setApi={setApi} className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center">
                                <CarouselContent className={carouselHeight}>
                                    {galleryImages.map((image, index) => (
                                        <CarouselItem key={image.id} className="flex items-center justify-center">
                                            <button onClick={() => setFullscreen((curr) => !curr)} className="relative aspect-square h-full w-full max-w-4xl">
                                                <Image src={image.src} alt="Preview" fill className="object-contain" unoptimized priority={index === activeIndex} />
                                            </button>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                            <Button variant="ghost" size="icon" className="absolute right-4 z-10 hidden rounded-full sm:flex" onClick={() => api?.scrollNext()} disabled={!api?.canScrollNext()}>
                                <ChevronRight className="size-5" />
                            </Button>
                        </div>

                        <Thumbnails activeIndex={activeIndex} galleryImages={galleryImages} onThumbClick={onThumbClick} fullscreen={fullscreen} />
                    </div>
                </div>
            )}
        </>
    );
}

function Thumbnails({ activeIndex, galleryImages, onThumbClick, fullscreen }: { activeIndex: number; galleryImages: GalleryImage[]; onThumbClick: (index: number) => void; fullscreen: boolean }) {
    if (galleryImages.length <= 1 || fullscreen) return null;

    return (
        <div className="p-4">
            <div className="scrollbar-none mx-auto flex max-w-4xl justify-start gap-3 overflow-x-auto rounded-3xl p-3 sm:justify-center">
                {galleryImages.map((image, index) => (
                    <button
                        type="button"
                        key={`${image.id}-thumb`}
                        onClick={() => onThumbClick(index)}
                        className={cn("relative size-18 shrink-0 overflow-hidden rounded-xl transition-all duration-200", index === activeIndex ? "z-10 scale-105 opacity-100 ring-2 ring-white" : "opacity-40 hover:opacity-70")}
                    >
                        <Image src={image.src} alt="thumbnail" fill className="object-cover" unoptimized />
                    </button>
                ))}
            </div>
        </div>
    );
}
