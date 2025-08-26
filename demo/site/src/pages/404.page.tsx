import { type ReactNode } from "react";

interface NotFound404Props {
    children: ReactNode;
}
export default function NotFound404({ children }: NotFound404Props): JSX.Element {
    return (
        <>
            <h1>404 - Page Not Found</h1>
            {children}
        </>
    );
}
