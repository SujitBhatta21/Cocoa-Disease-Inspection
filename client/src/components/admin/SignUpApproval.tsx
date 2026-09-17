function SignUpApproval() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-2 text-xl font-bold">Pending Sign Up approvals</h2>
      <p className="max-w-2xl text-slate-600 dark:text-gray-400">
        This section is ready for the approval workflow. Add a user status field
        and an admin users endpoint before enabling approve and reject actions.
      </p>
    </div>
  );
}

export default SignUpApproval;
