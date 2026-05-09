import { Message } from "@/types/model";

export default function showNotification(message: Message) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const senderName = message.user?.name || "Someone";
    let notificationBody = "";

    if (message.messageType === "Text") {
        notificationBody = message.textContent || "Sent a message";
    } else if (message.messageType === "Image") {
        const imgCount = message.imageUrls?.length || 0;
        notificationBody = imgCount > 1 ? `📷 Sent ${imgCount} images` : "📷 Sent an image";
    } else {
        notificationBody = "Sent a message";
    }

    const notification = new Notification(`New message from ${senderName}`, {
        silent: false,
        tag: message.roomId,
        body: notificationBody,
        icon: message.user?.mainAvatarUrl || "/images/avatar.png",
    });

    const notificationSound = new Audio("/sounds/notification.mp3");
    notificationSound.currentTime = 0;
    notificationSound.play().catch((e) => console.error("Notification sound failed to play", e));

    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}
