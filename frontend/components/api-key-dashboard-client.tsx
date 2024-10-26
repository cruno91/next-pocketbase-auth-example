'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Key, Loader2, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateApiKey } from "@/lib/api-keys";

type ApiKey = {
  id: string;
  name: string;
  created: string;
  last_used: string;
  key?: string;
};

type User = {
  id: string;
  email: string;
};

type ApiKeyDashboardClientProps = {
  initialApiKeys: ApiKey[];
  user: User;
  token: string;
};

export default function ApiKeyDashboardClient({ initialApiKeys, token }: ApiKeyDashboardClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [clientRendered, setClientRendered] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [rawApiKey, setRawApiKey] = useState<string | null>(null);

  useEffect(() => {
    setClientRendered(true);
  }, []);

  const handleCreateKey = async () => {
    const generatedKey = generateApiKey();
    setRawApiKey(generatedKey);
    setShowKeyModal(true); // Show the API key modal
  };

  const handleConfirmKeySave = async () => {
    setIsCreatingKey(true);
    if (!rawApiKey || !newKeyName) return;

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName, apiKey: rawApiKey }), // Save the key to Pocketbase
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys((prevKeys) => [...prevKeys, newKey]);
        setNewKeyName("");
        setRawApiKey(null);
        setShowKeyModal(false);
      } else {
        throw new Error('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCopyRawKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      const response = await fetch(`/api/api-keys?id=${keyToRevoke.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyToRevoke.id));
        setKeyToRevoke(null);
      } else {
        throw new Error('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
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

      <Dialog open={showKeyModal} onOpenChange={() => setShowKeyModal(false)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              This is your only opportunity to copy the raw key. Please make sure to copy and save it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-gray-100 rounded overflow-x-auto max-w-full">
            <code className="break-words text-lg">{rawApiKey}</code>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => rawApiKey && handleCopyRawKey(rawApiKey)}>
              <Copy className="mr-2 h-4 w-4" /> Copy Key
            </Button>
            <Button variant="default" onClick={handleConfirmKeySave} disabled={isCreatingKey}>
              Confirm and Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your API Keys</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.name}</TableCell>
                <TableCell>{clientRendered ? (apiKey.created ? new Date(apiKey.created).toLocaleString() : 'recently') : '...'}</TableCell>
                <TableCell>{clientRendered ? (apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never') : '...'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
