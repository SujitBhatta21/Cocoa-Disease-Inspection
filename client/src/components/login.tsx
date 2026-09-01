interface LoginProps {
  handleSubmitLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleNotRegistered: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
}

function Login({ handleSubmitLogin, handleNotRegistered }: LoginProps) {
  return (
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
            name="username"
            type="email"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
        </label>
        <label className="flex flex-col gap-1 border-1 p-5 items-start">
          Password
          <input
            required
            name="password"
            type="password"
            className="bg-gray-200 hover:bg-gray-300 border-1 pl-1"
          />
        </label>

        <button
          className="bg-green-400 gap-3 hover:bg-green-500 text-black cursor-pointer"
          type="submit"
          value="save"
        >
          LOGIN
        </button>
      </form>
      <button
        onClick={handleNotRegistered}
        className="text-blue-300 gap-2 hover:text-blue-400 cursor-pointer"
      >
        Not registered yet?
      </button>
    </div>
  );
}

export default Login;
