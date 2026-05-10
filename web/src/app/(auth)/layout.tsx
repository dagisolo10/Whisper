import { ReactNode } from "react";
import { isLocal } from "@/constants/env";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Side from "@/components/auth/ui/side";

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const { userId } = await auth();

    if (userId && !isLocal) return redirect("/");

    return (
        <main className="min-h-screen p-3 sm:p-4 lg:p-6">
            <div className="mx-auto grid gap-4 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.2fr)]">
                <Side />
                <div>{children}</div>
            </div>
        </main>
    );
}
