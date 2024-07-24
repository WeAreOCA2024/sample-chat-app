import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">Welcome Home</h1>
        <div className="space-y-4">
          <LinkButton href="/root" text="Start with root" />
          <LinkButton href="/kmjak" text="Start with kmjak" />
          <LinkButton href="/user1" text="Start with user1" />
          <LinkButton href="/user2" text="Start with user2" />
        </div>
      </div>
    </main>
  );
}

function LinkButton({ href, text }: { href: string, text: string }) {
  return (
    <Link href={href} className="block">
      <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
        {text}
      </button>
    </Link>
  );
}