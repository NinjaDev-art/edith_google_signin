"use client";

import { useClerk } from "@clerk/nextjs";
import * as React from "react";
import './Spinner.css';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  React.useEffect(() => {
    void handleRedirectCallback({
      redirectUrl: "/tasks",
    });
  }, [handleRedirectCallback]);

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-describedby="loading-description"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="spinner"></div>
    </div>
  );
}
