"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, Search, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types/model";
import useNoOpenChat from "@/hooks/use-no-open-chat";

export default function SearchSheet() {
    const { query, result, searching, showEmpty, showResults, handleUserClick, handleQueryChange } = useNoOpenChat();

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
                        {searching && <Searching />}

                        {showEmpty && <EmptyResult />}

                        {showResults && <SearchResults result={result} onClick={(userId) => handleUserClick(userId)} />}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function SearchResults({ result, onClick }: { result: User[]; onClick: (userId: string) => void }) {
    return (
        <motion.div key="results-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {result.map((user, index) => (
                <motion.button
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeIn", delay: index * 0.05 }}
                    onClick={() => onClick(user.id)}
                    className="group hover:bg-primary/10 flex cursor-pointer items-center justify-between rounded-2xl px-4 py-2 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <Avatar className="border-primary/20 size-8 border-2">
                            <AvatarImage src={user.mainAvatarUrl ?? undefined} />
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
            ))}
        </motion.div>
    );
}

function Searching() {
    return (
        <motion.div
            className="text-muted-foreground flex flex-col items-center py-20"
            key="searching-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Loader2 className="text-primary size-8 animate-spin" />
            <p className="mt-4 text-sm">Searching the network...</p>
        </motion.div>
    );
}

function EmptyResult() {
    return (
        <motion.div
            className="flex flex-col items-center py-20 text-center"
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <Search className="text-muted-foreground size-8" />
            </div>
            <p className="text-foreground mt-4 font-medium">No users found</p>
            <p className="text-muted-foreground text-sm">Try a different name or email address.</p>
        </motion.div>
    );
}
