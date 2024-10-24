'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Key, Loader2, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateApiKey } from "@/lib/api-keys"

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

type User = {
  id: string;
  email: string;
  // Add other relevant fields from your auth model
};

type ApiKeyDashboardClientProps = {
  initialApiKeys: ApiKey[];
  user: User;
  token: string;
};

export default function ApiKeyDashboardClient({ initialApiKeys, user, token }: ApiKeyDashboardClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [clientRendered, setClientRendered] = useState(false);

  useEffect(() => {
    // This ensures the component is rendered fully on the client
    setClientRendered(true);
  }, []);

  const handleCreateKey = async () => {
    setIsCreatingKey(true);

    // Generate a secure API key on the client side
    const apiKey = generateApiKey(); // Secure random key

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token for user identification
        },
        body: JSON.stringify({ name: newKeyName, apiKey }), // Send both the key name and the raw key
      });

      if (response.ok) {
        const newKey = await response.json();

        // Ensure a new array is created for the updated state
        setApiKeys((prevKeys) => [...prevKeys, newKey]);

        setNewKeyName("");
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const handleRevokeKey = async () => {
    if (keyToRevoke) {
      try {
        const response = await fetch(`/api/api-keys/${keyToRevoke.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setApiKeys(apiKeys.filter((key) => key.id !== keyToRevoke.id));
        } else {
          throw new Error('Failed to revoke API key');
        }
      } catch (error) {
        console.error('Error revoking API key:', error);
      } finally {
        setKeyToRevoke(null);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2">Create New API Key</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button onClick={handleCreateKey} disabled={isCreatingKey || !newKeyName}>
            {isCreatingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
            Create Key
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your API Keys</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.name}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded">
                    {apiKey.key.slice(0, 8)}...{apiKey.key.slice(-4)}
                  </code>
                </TableCell>
                {/* Conditionally render dates after client is mounted */}
                <TableCell>
                  {clientRendered ? new Date(apiKey.created).toLocaleString() : '...'}
                </TableCell>
                <TableCell>
                  {clientRendered ? (apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never') : '...'}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyKey(apiKey.key)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setKeyToRevoke(apiKey)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Revoke
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key &#34;{keyToRevoke?.name}&#34;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRevoke(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevokeKey}>Revoke Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
