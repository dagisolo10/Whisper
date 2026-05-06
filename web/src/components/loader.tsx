import { Loader2 } from "lucide-react";

interface LoaderProp {
    loading: boolean;
}

export default function Loader({ loading }: LoaderProp) {
    if (!loading) return null;
    return <Loader2 className="text-foreground size-4 animate-spin" />;
}
