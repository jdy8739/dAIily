"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

interface AuthFormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: SubmitHandler<z.infer<T>>;
  submitText: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const AuthForm = <T extends z.ZodType>({
  schema,
  onSubmit,
  submitText,
  loading = false,
  children,
}: AuthFormProps<T>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {children}
      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        {submitText}
      </Button>
    </form>
  );
};

const FormField = ({
  name,
  label,
  type = "text",
  register,
  error,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  register: any;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...register(name)}
    type={type}
    label={label}
    error={error}
    {...props}
  />
);

export default AuthForm;
export { FormField };
