import { cn } from "@/lib/utils";
import { GalleryImage } from "@/types/types";
import { Button } from "@/components/ui/interactive";
import { Text, View } from "@/components/ui/display";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated, FlatList, Image, Modal, Pressable } from "react-native";

interface ImagePreviewProp {
    width: number;
    galleryImages: GalleryImage[];
    initialIndex?: number;
    children: ReactNode | ((controls: { openPreview: (index?: number) => void }) => ReactNode);
}

export default function ImagePreview({ width, galleryImages, initialIndex = 0, children }: ImagePreviewProp) {
    const inset = useSafeAreaInsets();
    const [showPreview, setShowPreview] = useState(true);
    const [galleryVisible, setGalleryVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(initialIndex);

    const galleryRef = useRef<FlatList<GalleryImage>>(null);
    const previewRef = useRef<FlatList<GalleryImage>>(null);
    const pendingIndexRef = useRef(initialIndex);

    function scrollGallery(index: number, animated: boolean) {
        galleryRef.current?.scrollToOffset({ offset: index * width, animated });
    }

    function syncPreview(index: number) {
        if (index < 0 || index >= galleryImages.length) return;
        previewRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }

    function openPreview(index = initialIndex) {
        const clamped = Math.min(Math.max(index, 0), Math.max(galleryImages.length - 1, 0));
        setActiveImageIndex(clamped);
        pendingIndexRef.current = clamped;
        setGalleryVisible(true);
        setShowPreview(true);
    }

    function handleGalleryScrollEnd(offsetX: number) {
        const nextIndex = Math.round(offsetX / width);

        if (nextIndex === activeImageIndex) return;

        setActiveImageIndex(nextIndex);
        syncPreview(nextIndex);
    }

    function jumpToImage(index: number) {
        setActiveImageIndex(index);
        scrollGallery(index, true);
        syncPreview(index);
    }

    const trigger = typeof children === "function" ? children({ openPreview }) : <Pressable onPress={() => openPreview()}>{children}</Pressable>;

    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!galleryVisible) return;
        Animated.timing(opacity, {
            toValue: showPreview ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [galleryVisible, opacity, showPreview]);

    return (
        <>
            {trigger}

            <Modal
                animationType="fade"
                statusBarTranslucent
                visible={galleryVisible}
                onShow={() => {
                    scrollGallery(pendingIndexRef.current, false);
                    syncPreview(pendingIndexRef.current);
                }}
                onRequestClose={() => setGalleryVisible(false)}
            >
                <View className="flex-1 bg-black" style={{ paddingTop: inset.top, paddingBottom: inset.bottom }}>
                    <Button className={cn(showPreview ? "block" : "hidden", "absolute top-12 right-6 z-10")} onPress={() => setGalleryVisible(false)} variant="ghost">
                        Close
                    </Button>

                    <FlatList
                        horizontal
                        pagingEnabled
                        ref={galleryRef}
                        data={galleryImages}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onMomentumScrollEnd={(event) => handleGalleryScrollEnd(event.nativeEvent.contentOffset.x)}
                        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                        renderItem={({ item }) => (
                            <Pressable onPress={() => setShowPreview((curr) => !curr)} style={{ width }}>
                                <Image source={{ uri: item.uri }} resizeMode="contain" className="size-full" accessibilityLabel={item.label} />
                            </Pressable>
                        )}
                    />

                    <Animated.View style={{ opacity }} className={cn("absolute right-0 bottom-0 left-0 gap-3 bg-black/80 px-4 pt-4 pb-12")}>
                        <Text className="text-center text-sm font-bold text-white/70">
                            {activeImageIndex + 1} / {galleryImages.length}
                        </Text>

                        <FlatList
                            ref={previewRef}
                            data={galleryImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
                            keyExtractor={(item) => `${item.id}-preview`}
                            getItemLayout={(_, index) => ({ length: 84, offset: 84 * index, index })}
                            onScrollToIndexFailed={({ index }) => setTimeout(() => previewRef.current?.scrollToOffset({ offset: 84 * index, animated: true }), 50)}
                            renderItem={({ item, index }) => {
                                const isActive = index === activeImageIndex;

                                return (
                                    <Pressable onPress={() => jumpToImage(index)} className="overflow-hidden rounded-2xl">
                                        <Image
                                            source={{ uri: item.uri }}
                                            accessibilityLabel={`${item.label} preview`}
                                            className="size-18 rounded-2xl"
                                            style={{ opacity: isActive ? 1 : 0.45, borderWidth: isActive ? 1 : 0, borderColor: "#73738c" }}
                                        />
                                    </Pressable>
                                );
                            }}
                        />
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}
