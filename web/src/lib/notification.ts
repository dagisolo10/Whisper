import { Message } from "@/types/model";

export default function showNotification(message: Message) {
    const senderName = message.user?.name || "Someone";
    let notificationBody = "";

    if (message.messageType === "Text") {
        notificationBody = message.textContent || "Sent a message";
    } else if (message.messageType === "Image") {
        const imgCount = message.imageUrls?.length || 0;
        notificationBody = imgCount > 1 ? `📷 Sent ${imgCount} images` : "📷 Sent an image";
    }

    const notification = new Notification(`New message from ${senderName}`, {
        silent: false,
        tag: message.roomId,
        body: notificationBody,
        icon: message.user?.mainAvatarUrl || "/images/coder.jpg",
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}
