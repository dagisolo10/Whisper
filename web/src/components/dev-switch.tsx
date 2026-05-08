"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import useUser from "@/store/auth-store";

type User = { id: string; name: string };

const users: User[] = [
    { id: "user_3DIbL8PHZevVH7YX8SGNJ3CIi7X", name: "Ayakashi" },
    { id: "user_2_alex", name: "Alex Rivera" },
    { id: "user_3_sarah", name: "Sarah Chen" },
    { id: "user_4_jordan", name: "Jordan Smith" },
    { id: "user_5_elias", name: "Elias Morgan" },
    { id: "user_6_mimi", name: "Mimi Kim" },
    { id: "user_7_liam", name: "Liam Wilson" },
    { id: "user_8_noah", name: "Noah Brown" },
    { id: "user_9_sophia", name: "Sophia Garcia" },
    { id: "user_10_lucas", name: "Lucas Miller" },
    { id: "user_11_hana", name: "Hana Bekele" },
    { id: "user_12_daniel", name: "Daniel Kim" },
];

export function DevUserSwitch() {
    const user = useUser((s) => s.user);
    const [showAll, setShowAll] = useState(false);
    const [activeUser, setActiveUser] = useState<User | null>(user);

    const handleSwitch = (user: User) => {
        setActiveUser(user);
        localStorage.setItem("test_user_id", user.id);
        window.location.reload();
    };

    return (
        <div className="space-y-4 overflow-hidden rounded-4xl border px-6 py-4" onClick={() => setShowAll((curr) => !curr)}>
            <div className="flex justify-between">
                <p>{activeUser?.name}</p>
                {showAll ? <ChevronUp className="text-muted-foreground size-5" /> : <ChevronDown className="text-muted-foreground size-5" />}
            </div>

            {showAll && (
                <div className="scrollbar-none flex h-full flex-col gap-2 overflow-y-auto pb-12">
                    {users.map((user) => (
                        <Button variant={"outline"} key={user.id} onClick={() => handleSwitch(user)}>
                            {user.name}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
