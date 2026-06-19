import { signIn, signUp } from "./actions";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Login or signup</h1>
      {params.message ? <p className="mt-4 rounded-md border border-[var(--border)] bg-white p-3 text-sm">{params.message}</p> : null}
      <form className="mt-6 grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="field" name="email" type="email" required />
        </label>
        <label className="grid gap-1">
          <span className="label">Password</span>
          <input className="field" name="password" type="password" minLength={6} required />
        </label>
        <div className="flex gap-3">
          <button className="btn btn-primary flex-1" formAction={signIn}>Login</button>
          <button className="btn btn-secondary flex-1" formAction={signUp}>Signup</button>
        </div>
      </form>
    </main>
  );
}
