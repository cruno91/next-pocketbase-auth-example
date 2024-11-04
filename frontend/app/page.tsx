import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="https://nextjs.org/icons/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <span>+</span>
          <Image
            src="https://dbdb.io/media/logos/pocketbase.svg"
            alt="Pocketbase logo"
            width={180}
            height={38}
          />
        </div>
        <ol
          className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by registering an account{" "}
            <Link href="/register">
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                /register
              </code>
            </Link>
            .
          </li>
          <li>
            Then login{" "}
            <Link href="/login">
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                /login
              </code>
            </Link>
            !
          </li>
          <li>
            Visit <a href="/api-keys">the API keys dashboard </a> to generate keys for your account.
          </li>
          <li>
            Visit <a href="/content">the content dashboard </a> to manage content for your account.
          </li>
          <li>
            Visit <a href="db.authexample.lndo.site/_/">the Pocketbase dashboard </a> to look around.
          </li>
        </ol>
      </main>
    </div>
  );
}
