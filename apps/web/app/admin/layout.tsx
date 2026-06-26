import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <div className="fp-admin-root">{children}</div>;
}
