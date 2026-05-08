import { User } from "@/types/model";
import useChat from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { MessageSquareDashed, Hand } from "lucide-react";

export default function NoMessages({ partner: partner }: { partner: User }) {
    const { sendWave } = useChat();

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <div>
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="bg-accent/20 mb-4 flex size-20 items-center justify-center rounded-full ring-1 ring-white/10">
                        <MessageSquareDashed className="text-muted-foreground size-10 animate-pulse" />
                    </div>

                    <h3 className="font-jakarta text-xl font-semibold text-white">Quiet in here...</h3>
                    <p className="text-muted-foreground mt-2 max-w-62.5 text-sm">
                        No whispers yet.{" "}
                        <span className="text-white">
                            Say hello to <br />
                            {partner.name}{" "}
                        </span>
                        <br />
                        to start the conversation!
                    </p>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="bg-primary/20 flex size-12 rotate-3 items-center justify-center rounded-2xl">
                        <Hand className="text-primary size-6" />
                    </div>
                    <Button
                        onClick={() => sendWave(partner.id)}
                        variant={"outline"}
                        aria-label={`Wave hello to ${partner.name}`}
                        className="rounded-full px-4 text-sm font-semibold transition hover:scale-105 active:scale-95"
                    >
                        👋 Wave Hello
                    </Button>
                </div>
            </div>
        </div>
    );
}
