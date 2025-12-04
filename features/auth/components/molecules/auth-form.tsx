"use client";

import { useForm, SubmitHandler, FieldValues, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

interface AuthFormProps<T extends z.ZodType<FieldValues>> {
  schema: T;
  onSubmit: SubmitHandler<z.infer<T>>;
  submitText: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const AuthForm = <T extends z.ZodType<FieldValues>>({
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
    // @ts-expect-error - zodResolver type incompatibility with generic zod schemas
    resolver: zodResolver(schema),
  });

  return (
    // @ts-expect-error - generic type compatibility issue
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
  register: UseFormRegister<FieldValues>;
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