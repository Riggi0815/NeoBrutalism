"use client";

import { useState } from "react";
import { LogOut, Sparkles, User } from "lucide-react";
import { Button, DropdownMenu, Header, HeaderBrand } from "@/design-system/components";

/**
 * Showcase-only (not part of the design-system): shows that `actions` can
 * be swapped — "Sign Up" while logged out, a user menu once logged in.
 * It needs state and handlers, so it is a Client Component of its own.
 */
export function HeaderDemo() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Header
      brand={<HeaderBrand icon={<Sparkles />} name="NeoBrut" href="#header" />}
      links={[
        { label: "Home", href: "#header", active: true },
        { label: "About", href: "#header" },
        { label: "Blog", href: "#header" },
      ]}
      actions={
        loggedIn ? (
          <DropdownMenu
            label="Rick"
            icon={<User />}
            align="end"
            items={[
              { label: "Profile", icon: <User /> },
              { label: "Sign out", icon: <LogOut />, onSelect: () => setLoggedIn(false) },
            ]}
          />
        ) : (
          <Button size="sm" onClick={() => setLoggedIn(true)}>
            Sign Up
          </Button>
        )
      }
    />
  );
}
