type ChatImage = {
    label: string;
};

export type ChatMessage = {
    id: number;
    sender: "me" | "them";
    text: string;
    time: string;
    image?: ChatImage;
    images?: ChatImage[];
    read?: boolean;
};

export const chatThread: {
    participant: {
        name: string;
        handle: string;
        status: string;
        avatar: string;
        color: string;
    };
    messages: ChatMessage[];
} = {
    participant: {
        name: "Next.js Masters",
        handle: "@nextjs_masters",
        status: "Online",
        avatar: "NM",
        color: "from-blue-400 to-black",
    },
    messages: [
        {
            id: 1,
            sender: "them",
            text: "I pushed a rough cut of the desktop chat flow. It finally feels closer to a real messenger.",
            time: "9:12 AM",
        },
        {
            id: 2,
            sender: "me",
            text: "Nice. The overall rhythm is strong already. I want the open state to feel more alive though, especially once media starts showing up.",
            time: "9:13 AM",
            read: true,
        },
        {
            id: 3,
            sender: "them",
            text: "Same thought. I started collecting references for message spacing, image cards, and sticky headers.",
            time: "9:14 AM",
        },
        {
            id: 4,
            sender: "them",
            text: "Dropping the first placeholder here. Replace this with your real shot later.",
            time: "9:14 AM",
            image: {
                label: "Workspace screenshot placeholder",
            },
        },
        {
            id: 5,
            sender: "me",
            text: "This is perfect for testing. I also want a longer thread so I can judge scroll behavior and spacing over time.",
            time: "9:16 AM",
            read: true,
        },
        {
            id: 6,
            sender: "them",
            text: "Then let's keep going. Imagine this is midway through a design sprint and we are trading notes, revisions, and quick check-ins all day.",
            time: "9:18 AM",
        },
        {
            id: 7,
            sender: "me",
            text: "Exactly. I want enough content to see how compact text blocks, long paragraphs, and media all sit together in one conversation.",
            time: "9:21 AM",
            read: true,
        },
        {
            id: 8,
            sender: "them",
            text: "I mocked a few states: a hero image, a stacked gallery placeholder, and a simple file-style tile. The gallery one should help you test wider message cards.",
            time: "9:23 AM",
        },
        {
            id: 9,
            sender: "them",
            text: "Here is the gallery placeholder.",
            time: "9:24 AM",
            images: [{ label: "Gallery image A" }, { label: "Gallery image B" }],
        },
        {
            id: 10,
            sender: "me",
            text: "The square pair is helpful. I can swap in actual product shots later and check whether the crop still feels balanced.",
            time: "9:27 AM",
            read: true,
        },
        {
            id: 11,
            sender: "them",
            text: "One more thing: I added enough narrative here so the thread feels naturally long instead of repetitive filler. That should make layout testing much more honest.",
            time: "9:31 AM",
        },
        {
            id: 12,
            sender: "me",
            text: "Good call. I also need to see how timestamps and bubbles read after a dozen messages, not just three.",
            time: "9:34 AM",
            read: true,
        },
        {
            id: 13,
            sender: "them",
            text: "We can pretend this is the part where I send over a vertical composition mock for the attachment renderer.",
            time: "9:35 AM",
            image: {
                label: "Portrait mock placeholder",
            },
        },
        {
            id: 14,
            sender: "me",
            text: "That gives the conversation some variety. The different aspect ratios will help catch awkward padding fast.",
            time: "9:38 AM",
            read: false,
        },
        {
            id: 15,
            sender: "them",
            text: "Last note from me: once the real data flow exists, this can be swapped for production state pretty easily. For now it is just a good visual sandbox.",
            time: "9:42 AM",
        },
    ],
};
