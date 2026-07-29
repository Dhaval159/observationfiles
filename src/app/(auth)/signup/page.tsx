"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="bg-foreground text-background mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold">
            OF
          </span>
          <h1 className="text-foreground text-xl font-semibold">Create Account</h1>
          <p className="text-muted mt-1 text-sm">Begin your detective journey</p>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <Input label="Display Name" placeholder="Detective Name" />
            <Input label="Email" type="email" placeholder="detective@example.com" />
            <Input label="Password" type="password" placeholder="Create a password" />
            <Input label="Confirm Password" type="password" placeholder="Confirm your password" />
            <Button variant="primary" className="w-full">
              Create Account
            </Button>

            <Divider />

            <p className="text-muted text-center text-xs">
              Already have an account?{" "}
              <a href="/login" className="text-accent hover:underline">
                Sign in
              </a>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
