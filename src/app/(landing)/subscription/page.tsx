"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";




const SubscriptionPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      // fake API call
      await new Promise((res) => setTimeout(res, 1000));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 max-w-sm w-full space-y-4">
        <h1 className="text-xl font-semibold text-center">Subscribe</h1>
        <Input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <Button onClick={handleSubscribe} disabled={status === "loading"}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
        {status === "success" && <p className="text-green-600 text-sm">Subscribed!</p>}
        {status === "error" && <p className="text-red-600 text-sm">Something went wrong.</p>}
      </div>
    </div>
  );
};

export default SubscriptionPage;
