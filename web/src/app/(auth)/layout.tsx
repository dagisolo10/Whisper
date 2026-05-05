import { ReactNode } from "react";
import Side from "@/components/auth/side";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const { userId } = await auth();

    if (userId) redirect("/");

    return (
        <main className="min-h-screen bg-[#0b0d12] p-3 sm:p-4 lg:p-6">
            <div className="mx-auto grid max-w-375 gap-4 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.2fr)]">
                <Side />
                <div>{children}</div>
            </div>
        </main>
    );
}
