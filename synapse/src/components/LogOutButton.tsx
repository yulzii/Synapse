"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logOutAction } from "../actions/users";

function LogOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    setLoading(true);

    const { errorMessage } = await logOutAction();
    if (!errorMessage) {
      toast.success("Success", {
        description: "You have been logged out successfully.",
      });
      router.push("/");
    } else {
      toast.error("Error", {
        description: errorMessage,
      });
    }
    setLoading(false);
  };
  return (
    <Button
      variant="outline"
      className="w-24"
      onClick={handleLogOut}
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
}

export default LogOutButton;
