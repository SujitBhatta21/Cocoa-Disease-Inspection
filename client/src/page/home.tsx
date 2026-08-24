function Home() {
  const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e.currentTarget);

    const form = e.currentTarget;
    const formData = new FormData(form);
    console.log(formData);

    console.log(formData.get("email"));

    const response = await fetch(`${VITE_SERVER_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    console.log("response is it true:", response.body);

    if (!response.ok) {
      alert(`HTTP Error: ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  return (
    <div>
      <header className="text-2xl font-bold">App</header>{" "}
      <div className="border-2 min-h-screen flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmitLogin}
          className="flex flex-col gap-4 border-3 border-radius-1 p-4 bg-[#D3D3D3]"
        >
          <h2>Login Page</h2>
          <label className="flex flex-col gap-1 border-1 p-5 items-start">
            Username/Email
            <input
              required
              name="email"
              type="email"
              className="bg-gray-200 hover:bg-gray-300 border-1"
            />
          </label>
          <label className="flex flex-col gap-1 border-1 p-5 items-start">
            Password
            <input
              required
              name="password"
              type="password"
              className="bg-gray-200 hover:bg-gray-300 border-1"
            />
          </label>

          <button
            className="bg-green-400 gap-3 hover:bg-green-500 text-black"
            type="submit"
            value="save"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
