"use client";
import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, Search, Loader2, ArrowRight, Lock } from "lucide-react";
import useUser from "@/store/auth-store";
import useRoom from "@/store/room-store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types/model";

export default function NoOpenChat() {
    return (
        <section className="bg-background/50 relative hidden h-screen flex-1 xl:flex">
            <div className="bg-primary/10 absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full blur-[120px]" />
            <div className="bg-chart-3/5 absolute right-0 -bottom-24 size-96 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 text-center"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative">
                    <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full opacity-20" />
                    <div className="bg-card border-border relative flex size-24 items-center justify-center rounded-[2em] border shadow-2xl backdrop-blur-md">
                        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-xl">
                            <MessageSquarePlus className="text-primary size-7" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="space-y-3">
                    <h2 className="font-jakarta text-foreground text-4xl font-bold tracking-tight">Welcome to Whisper</h2>
                    <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
                        Your space for secure, seamless, and meaningful conversations. Select a chat to begin or start a fresh connection.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="flex w-full max-w-2xl justify-center gap-6"
                >
                    <SearchSheet />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="bg-muted/50 border-border text-muted-foreground absolute right-8 bottom-8 flex items-center gap-3 rounded-full border px-5 py-2.5 text-xs backdrop-blur-sm"
                >
                    <div className="flex size-2 items-center justify-center rounded-full bg-green-500/20">
                        <div className="size-1 rounded-full bg-green-500" />
                    </div>
                    <Lock className="size-3.5" />
                    <span className="font-medium">End-to-end encrypted</span>
                </motion.div>
            </motion.div>
        </section>
    );
}

export function SearchSheet() {
    const rooms = useRoom((s) => s.rooms);
    const lastToken = useUser((s) => s.lastToken);
    const searching = useUser((s) => s.searching);
    const createRoom = useRoom((s) => s.createRoom);
    const searchUser = useUser((s) => s.searchUser);

    const router = useRouter();

    const [query, setQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [result, setResult] = useState<User[]>([]);

    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    function handleQueryChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setQuery(value);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (value.trim().length > 0) {
            timeoutRef.current = setTimeout(async () => {
                const result = await searchUser(value, lastToken ?? "");
                setResult(result);
            }, 500);
        }
    }

    async function handleUserClick(partnerId: string) {
        if (isCreating) return;
        setIsCreating(true);

        const room = rooms.find((room) => room.members.some((mem) => mem.userId === partnerId));
        const payload = { partnerId };

        if (!room) {
            toast.promise(createRoom(payload, lastToken ?? ""), {
                success: (data) => {
                    router.push(`/${data?.id}`);
                },
                error: (err: string) => err || "Failed to start conversation",
                finally: () => {
                    setIsCreating(false);
                },
            });
        } else {
            router.push(`/${room.id}`);
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-card/50 hover:bg-card group border-border hover:shadow-primary/5 flex h-auto w-64 flex-col items-center gap-4 rounded-[2rem] p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                    <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                        <MessageSquarePlus className="size-6" />
                    </div>
                    <div>
                        <p className="font-jakarta text-foreground text-lg font-semibold">New Message</p>
                        <p className="text-muted-foreground mt-1 text-xs font-normal">Start a new conversation</p>
                    </div>
                </Button>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="bg-background/40 mx-auto w-full max-w-xl items-center rounded-t-[2rem] border-t border-white/10 pb-4 backdrop-blur-3xl data-[side=bottom]:h-[95vh]"
            >
                <div className="bg-muted-foreground/20 mx-auto mt-2 h-1.5 w-12 rounded-full" />

                <SheetHeader className="flex flex-col items-center gap-2">
                    <SheetTitle className="text-2xl font-bold">Find someone on Whisper</SheetTitle>
                    <div className="group relative w-full max-w-md">
                        <Search className="group-focus-within:text-primary text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2 transition-colors" />
                        <Input placeholder="Search by name or email..." value={query} onChange={handleQueryChange} className="h-9 w-full rounded-2xl pl-12" />
                    </div>
                </SheetHeader>

                <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex w-full flex-1 flex-col gap-2 overflow-y-auto px-4">
                    <AnimatePresence mode="popLayout">
                        {searching ? (
                            <Searching />
                        ) : query.length > 0 && result.length === 0 ? (
                            <EmptyResult />
                        ) : (
                            result.map((user, index) => <UserLink index={index} key={user.id} user={user} onClick={() => handleUserClick(user.id)} />)
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function UserLink({ user, onClick, index }: { user: User; index: number; onClick: (userId: string) => void }) {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeIn", delay: index * 0.05 }}
            onClick={() => onClick(user.id)}
            className="group hover:bg-primary/10 flex cursor-pointer items-center justify-between rounded-2xl px-4 py-2 transition-all"
        >
            <div className="flex items-center gap-4">
                <Avatar className="border-primary/20 size-8 border-2">
                    <AvatarImage src={user.mainAvatarUrl + "21"} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="text-left">
                    <p className="text-foreground font-semibold">{user.name}</p>
                    <p className="text-muted-foreground text-xs font-semibold">@{user.username}</p>
                </div>
            </div>
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100">
                <ArrowRight className="size-5" />
            </div>
        </motion.button>
    );
}

function Searching() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground flex flex-col items-center py-20">
            <Loader2 className="text-primary size-8 animate-spin" />
            <p className="mt-4 text-sm">Searching the network...</p>
        </motion.div>
    );
}

function EmptyResult() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <Search className="text-muted-foreground size-8" />
            </div>
            <p className="text-foreground mt-4 font-medium">No users found</p>
            <p className="text-muted-foreground text-sm">Try a different name or email address.</p>
        </motion.div>
    );
}
