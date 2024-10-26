import { cookies } from 'next/headers';
import ExampleContentDashboard from '@/components/content-dashboard-client';
import { logout } from '../actions';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from 'next/link';

async function getContentItems(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/content`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch content items');
  }

  return response.json();
}

export default async function ExampleContentDashboardPage() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (!authCookie) {
    return <div>Not authenticated</div>;
  }

  const { token, model } = JSON.parse(authCookie.value);
  let contentItems = [];

  try {
    contentItems = await getContentItems(token);
  } catch (error) {
    console.error('Failed to fetch content items:', error);
    contentItems = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Next.js + Pocketbase Content Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {model.email}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={model.avatarUrl} alt={model.email} />
                    <AvatarFallback>{model.email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{model.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{model.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logout}>
                    <button className="w-full text-left">Log out</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Content Dashboard</h1>
          <ExampleContentDashboard initialContent={contentItems} token={token} />
        </div>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Your App Name. All rights reserved.
          </p>
          <nav className="flex space-x-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
