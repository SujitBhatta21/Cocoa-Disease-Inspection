function LoggedIn(
  handleLogout: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>,
) {
  return (
    <main className="flex flex-col justify-center align-items gap-4 p-10 m-5">
      <h1>LOGGED IN ALREADY</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white hover:bg-red-600 cursor-pointer rounded-lr padding 5"
      >
        Log Out
      </button>
    </main>
  );
}

export default LoggedIn;
