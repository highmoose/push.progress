"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import Image from "next/image";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const users = {
    Adam: {
      username: "Adam",
      id: 1,
      password: process.env.NEXT_PUBLIC_ADAM_PASSWORD,
    },
    Cory: {
      username: "Cory",
      id: 2,
      password: process.env.NEXT_PUBLIC_CORY_PASSWORD,
    },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    if (users[selectedUser].password !== password) {
      setError("Incorrect password");
      setPassword("");
      return;
    }

    // Store user data in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: users[selectedUser].id,
        username: users[selectedUser].username,
      })
    );
    router.push("/home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] font-[family-name:var(--font-roboto)]">
      {/* Hero Section - Top */}
      <div className="relative flex flex-1 flex-col items-start justify-center bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#0a0a0a] px-8 py-16">
        <div className="mb-4">
          <Image
            src="/images/logo/push-logo-w.svg"
            alt="Push Progress Logo"
            width={28}
            height={28}
          />
          {/* <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-xl">✦</span>
            <span className="font-light tracking-wider">
              Get Stronger Faster
            </span>
          </div> */}
        </div>
        <h1 className="mb-6 max-w-md text-4xl font-light leading-tight text-white font-[family-name:var(--font-tektur)]">
          Track. Compare. Improve. Your Fitness Journey Starts Here.
        </h1>
        <p className="mt-auto text-xs text-gray-500">
          Rest & recovery is not absence,
          <br />
          but the prerequisite for greatness.
        </p>
      </div>

      {/* Login Section - Bottom */}
      <div className="flex flex-col items-center bg-[#0a0a0a] px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            {/* <div className="mb-2 text-2xl text-white">✦</div> */}
            <h2 className="mb-1 text-xl font-medium text-white font-[family-name:var(--font-tektur)]">
              Login
            </h2>
            <p className="text-sm text-gray-500">Dont be a pussy. Smash PB's</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* User Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="lg"
                onPress={() => setSelectedUser("Adam")}
                variant={selectedUser === "Adam" ? "solid" : "bordered"}
                color={selectedUser === "Adam" ? "primary" : "default"}
                className="font-[family-name:var(--font-tektur)]"
              >
                Adam
              </Button>
              <Button
                type="button"
                size="lg"
                onPress={() => setSelectedUser("Cory")}
                variant={selectedUser === "Cory" ? "solid" : "bordered"}
                color={selectedUser === "Cory" ? "primary" : "default"}
                className="font-[family-name:var(--font-tektur)]"
              >
                Cory
              </Button>
            </div>

            {/* Password Input */}
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              size="lg"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              variant="bordered"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[12px] text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              }
            />

            {/* Error Message */}
            {error && (
              <div className="rounded-md border border-red-900/30 bg-red-950/20 px-4 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Enter Button */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-[family-name:var(--font-tektur)]"
            >
              Enter
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400">
              Terms of Service
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-400">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
