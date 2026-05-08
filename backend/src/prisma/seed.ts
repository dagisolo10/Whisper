import prisma from "@/lib/prisma";
import { MessageType } from "@prisma/client";

type SeedUser = {
    id: string;
    name: string;
    username: string;
    bio: string;
    avatarSeeds: string[];
    lastOnlineAt: Date;
};

const now = new Date();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

const myUserId = "user_3DIbL8PHZevVH7YX8SGNJ3CIi7X";

const seedUsers: SeedUser[] = [
    {
        id: myUserId,
        name: "Dagmawi",
        username: "dagim_dev",
        bio: "Building Whisper and polishing the tiny details.",
        avatarSeeds: ["Dagmawi", "Dagmawi-alt"],
        lastOnlineAt: new Date(now.getTime() - 5 * minute),
    },
    {
        id: "user_2_alex",
        name: "Alex Rivera",
        username: "arivera",
        bio: "Frontend engineer, coffee-first, replies fast when online.",
        avatarSeeds: ["Alex", "Alex-alt"],
        lastOnlineAt: new Date(now.getTime() - 18 * minute),
    },
    {
        id: "user_3_sarah",
        name: "Sarah Chen",
        username: "schen_codes",
        bio: "Product-minded builder who sends thoughtful late-night messages.",
        avatarSeeds: ["Sarah", "Sarah-alt"],
        lastOnlineAt: new Date(now.getTime() - 2 * hour),
    },
    {
        id: "user_4_jordan",
        name: "Jordan Smith",
        username: "jsmith",
        bio: "Always testing new ideas and shipping side projects.",
        avatarSeeds: ["Jordan", "Jordan-alt"],
        lastOnlineAt: new Date(now.getTime() - 36 * minute),
    },
    {
        id: "user_5_elias",
        name: "Elias Yilma",
        username: "elias_y",
        bio: "Backend-focused, usually online after lunch.",
        avatarSeeds: ["Elias", "Elias-alt"],
        lastOnlineAt: new Date(now.getTime() - 9 * minute),
    },
    {
        id: "user_6_mimi",
        name: "Mimi Tadesse",
        username: "mimi_t",
        bio: "Designer who notices spacing issues before anything else.",
        avatarSeeds: ["Mimi", "Mimi-alt"],
        lastOnlineAt: new Date(now.getTime() - 4 * hour),
    },
    {
        id: "user_7_liam",
        name: "Liam Wilson",
        username: "liamw",
        bio: "Usually sends voice notes but types when necessary.",
        avatarSeeds: ["Liam", "Liam-alt"],
        lastOnlineAt: new Date(now.getTime() - 1 * day - 2 * hour),
    },
    {
        id: "user_8_noah",
        name: "Noah Brown",
        username: "noahb",
        bio: "Night owl engineer with too many browser tabs open.",
        avatarSeeds: ["Noah", "Noah-alt"],
        lastOnlineAt: new Date(now.getTime() - 7 * hour),
    },
    {
        id: "user_9_sophia",
        name: "Sophia Garcia",
        username: "sophiag",
        bio: "Writes clean docs and even cleaner commit messages.",
        avatarSeeds: ["Sophia", "Sophia-alt"],
        lastOnlineAt: new Date(now.getTime() - 3 * day - 45 * minute),
    },
    {
        id: "user_10_lucas",
        name: "Lucas Miller",
        username: "lucasm",
        bio: "Enjoys debugging the weird edge cases nobody else wants.",
        avatarSeeds: ["Lucas", "Lucas-alt"],
        lastOnlineAt: new Date(now.getTime() - 22 * minute),
    },
    {
        id: "user_11_hana",
        name: "Hana Bekele",
        username: "hanab",
        bio: "Mobile dev with a habit of sending tiny status updates.",
        avatarSeeds: ["Hana", "Hana-alt"],
        lastOnlineAt: new Date(now.getTime() - 2 * day - 3 * hour),
    },
    {
        id: "user_12_daniel",
        name: "Daniel Kim",
        username: "danielk",
        bio: "Quiet in group chats, active in one-on-one threads.",
        avatarSeeds: ["Daniel", "Daniel-alt"],
        lastOnlineAt: new Date(now.getTime() - 6 * day - 5 * hour),
    },
];

const conversationPartners = seedUsers.slice(1, 10);
const emptyUsers = seedUsers.slice(10);

const partnerOpeners = [
    "Morning. Did you get a chance to look at the issue from yesterday?",
    "I finally tried the latest build and it feels smoother already.",
    "Quick question, are we keeping the current chat layout?",
    "I pushed a small idea in my notes and wanted your take on it.",
    "The typing indicator is close, but I think the timing still feels off.",
    "I was thinking about the onboarding flow on my way home.",
    "Not urgent, but we should probably tighten the empty states.",
    "The latest UI pass looks good. Are you still tweaking the message cards?",
    "I tested on a slower connection and found a couple of rough edges.",
] as const;

const myReplies = [
    "Yeah, I saw it. I'm tracing it now and cleaning up a few related things too.",
    "That lines up with what I'm seeing. I want to keep the interaction feeling light.",
    "I'm leaning toward small changes instead of a full redesign for this pass.",
    "Nice catch. If we smooth the transitions, the whole screen should feel better.",
    "I agree. The behavior matters more than the visuals there.",
    "Let me finish the current backend cleanup and then I'll circle back to that.",
    "That makes sense. I want the defaults to feel solid before adding more options.",
    "I tested something similar earlier and it looked promising.",
    "I'm trying to keep the changes realistic so the seeded chats feel natural.",
] as const;

const followUps = ["Sounds good.", "That works for me.", "Let's do that.", "I like that direction.", "Fair point.", "Good call.", "Makes sense.", "That should help.", "Perfect."] as const;

function avatarUrl(seed: string) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function avatarUrls(seeds: string[]) {
    return seeds.map(avatarUrl);
}

function getCyclicItem<T>(items: readonly [T, ...T[]], index: number): T {
    return items[((index % items.length) + items.length) % items.length]!;
}

function buildMessageContent(partnerName: string, exchangeIndex: number, fromMainUser: boolean) {
    if (exchangeIndex === 0) {
        return fromMainUser ? getCyclicItem(myReplies, exchangeIndex) : getCyclicItem(partnerOpeners, exchangeIndex);
    }

    const topicCycle = exchangeIndex % 6;

    if (!fromMainUser) {
        if (topicCycle === 0) return `${partnerName}: I checked the latest flow again and the search feels much faster now.`;
        if (topicCycle === 1) return `${partnerName}: Could you also make sure the room list updates after a fresh login?`;
        if (topicCycle === 2) return `${partnerName}: I noticed the unread badge disappears correctly after opening the room.`;
        if (topicCycle === 3) return `${partnerName}: We should keep some sample chats quiet so the empty states are easy to test.`;
        if (topicCycle === 4) return `${partnerName}: The latest styling feels more balanced on my laptop than it did before.`;
        return `${partnerName}: Once you're done, send me the branch and I'll click through everything again.`;
    }

    if (topicCycle === 0) return `I just wrapped that part up. Next I'm checking how it behaves after a full refresh.`;
    if (topicCycle === 1) return `Yep, that's on my list. I want the initial load to feel reliable before anything else.`;
    if (topicCycle === 2) return `Nice, that means the room state is probably syncing the way we wanted.`;
    if (topicCycle === 3) return `Exactly. I left a few contacts without chats on purpose so the UI has realistic variety.`;
    if (topicCycle === 4) return `Great. I've been trying to make the spacing feel calmer without losing density.`;
    return `Send over anything odd you notice. It's easier to tune these details with real examples.`;
}

function buildConversationTimeline(roomIndex: number, totalMessages: number) {
    const roomStart = new Date(now.getTime() - (roomIndex + 2) * day - ((roomIndex % 3) * 3 + 1) * hour);
    const timestamps: Date[] = [];
    let current = roomStart.getTime();

    for (let i = 0; i < totalMessages; i++) {
        const dailyBurst = i % 8;
        const gapMinutes = dailyBurst === 0 ? 8 * 60 + roomIndex * 11 : dailyBurst === 1 ? 17 + roomIndex : dailyBurst === 2 ? 6 : dailyBurst === 3 ? 43 : dailyBurst === 4 ? 11 : dailyBurst === 5 ? 95 : dailyBurst === 6 ? 4 : 28;

        current += gapMinutes * minute;
        timestamps.push(new Date(current));
    }

    return timestamps;
}

async function main() {
    console.log("Emptying database...");
    await prisma.message.deleteMany();
    await prisma.member.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    console.log("Creating 12 users...");
    const users = await Promise.all(
        seedUsers.map((user) =>
            prisma.user.create({
                data: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    bio: user.bio,
                    mainAvatarUrl: avatarUrl(user.avatarSeeds[0] || user.name),
                    avatarUrls: avatarUrls(user.avatarSeeds),
                    lastOnlineAt: user.lastOnlineAt,
                },
            }),
        ),
    );

    const mainUser = users.find((user) => user.id === myUserId);
    if (!mainUser) throw new Error("Main seed user was not created");

    console.log("Creating active rooms with realistic message history...");

    for (const [roomIndex, partner] of conversationPartners.entries()) {
        const pairKey = [mainUser.id, partner.id].sort().join("_");

        const room = await prisma.room.create({
            data: {
                pairKey,
                members: {
                    create: [{ userId: mainUser.id }, { userId: partner.id }],
                },
                createdAt: new Date(now.getTime() - (roomIndex + 12) * day),
            },
        });

        const totalMessages = 40 + (roomIndex % 3) * 2;
        const timestamps = buildConversationTimeline(roomIndex, totalMessages);

        const createdMessages = [];

        for (let i = 0; i < totalMessages; i++) {
            const fromMainUser = i % 2 === 1;
            const senderId = fromMainUser ? mainUser.id : partner.id;
            const createdAt = timestamps[i];
            if (!createdAt) throw new Error(`Missing generated timestamp for room ${room.id} at index ${i}`);

            const followUp = getCyclicItem(followUps, roomIndex + i);
            const content = i < 2 ? buildMessageContent(partner.name, roomIndex, fromMainUser) : i % 9 === 0 && fromMainUser ? followUp : buildMessageContent(partner.name, i, fromMainUser);

            const message = await prisma.message.create({
                data: {
                    textContent: content,
                    imageUrls: [],
                    messageType: MessageType.Text,
                    senderId,
                    roomId: room.id,
                    createdAt,
                    read: i < totalMessages - 2 ? true : senderId !== mainUser.id,
                },
            });

            createdMessages.push(message);
        }

        const lastMessage = createdMessages.at(-1);

        if (lastMessage) {
            await prisma.room.update({
                where: { id: room.id },
                data: {
                    lastMessageId: lastMessage.id,
                    lastMessageAt: lastMessage.createdAt,
                },
            });
        }
    }

    console.log(`Seeding complete! ${seedUsers.length} users created, ${conversationPartners.length} active conversations, ${emptyUsers.length} users without chats.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
