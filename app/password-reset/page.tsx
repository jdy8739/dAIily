import PasswordResetForm from "../../features/auth/components/organisms/password-reset-form";

const PasswordResetPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daiily</h1>
          <p className="text-gray-600">Secure password recovery</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <PasswordResetForm />
      </div>
    </div>
  );
};

export default PasswordResetPage;
