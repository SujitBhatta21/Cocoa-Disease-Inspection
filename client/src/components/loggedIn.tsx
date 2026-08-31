interface LoggedInProps {
  handleLogout: () => void;
}

function LoggedIn({ handleLogout }: LoggedInProps) {
  return (
    <main className="flex min-h-[calc(100svh-5rem)] items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
          Active session
        </p>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
          You&rsquo;re already logged in
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Log out if you want to sign in with a different account.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full cursor-pointer rounded-lg bg-red-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          Log out
        </button>
      </section>
    </main>
  );
}

export default LoggedIn;
