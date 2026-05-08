type DateContext = "lastMessage" | "messageSent" | "lastOnline" | "daySeparator";

export const formatDate = (date: string | Date, context: DateContext) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (context === "messageSent") {
        return d.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    if (context === "daySeparator") {
        if (isToday) return "Today";
        return d.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    if (context === "lastOnline") {
        if (isToday) {
            return d.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }
        return d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    if (context === "lastMessage") {
        const diffInMs = now.getTime() - d.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (isToday) {
            return d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        }
        if (diffInDays < 7) {
            return d.toLocaleString("en-US", { weekday: "short" });
        }
        return d.toLocaleString("en-US", { month: "short", day: "numeric" });
    }

    return d.toLocaleDateString();
};

export const getInitials = (name: string) =>
    name
        .split(" ")
        .map((letter) => letter[0])
        .join("");
