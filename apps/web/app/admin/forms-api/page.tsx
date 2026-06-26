"use client";

import { FormakitPanel } from "formakit-panel";
import "formakit-panel/styles.css";

export default function FormsApiAdminPage() {
    return (
        <FormakitPanel
            storage={{
                type: "api",
                baseUrl: "/api",
            }}
        />
    );
}
