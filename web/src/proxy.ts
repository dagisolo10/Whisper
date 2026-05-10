import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAuthRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/forgot-password(.*)", "/verification(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const isLocal = process.env.NEXT_PUBLIC_LOCAL === "true";

    if (isLocal) return;

    if (userId && isAuthRoute(req)) {
        return NextResponse.redirect(new URL("/chats", req.url));
    }

    if (!userId && !isAuthRoute(req)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isAuthRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
