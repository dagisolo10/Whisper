export interface GalleryImage {
    id: string;
    src: string;
    alt: string;
}

export type PendingImage = {
    file: File;
    previewUrl: string;
    id: string;
};
