'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const FormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have than 8 characters'),
});

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (signInData?.error) {
      console.log(signInData.error);
      toast("Oops! Something went wrong");
    } else {
      console.log('Sign in successful');
      toast("Sign In Successfull!");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center space-y-2 text-center mb-6">
        <div className="flex items-center justify-center p-2 rounded-full bg-indigo-100">
          <Shield className="h-10 w-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
        <p className="text-sm text-gray-500">Welcome back to Hakikisha!</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
          <div className='space-y-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='mail@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className='w-full mt-6 bg-indigo-600' type='submit'>
            Sign in
          </Button>
        </form>
        <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
          or
        </div>
        <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-indigo-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
      </Form>
    </div>
  );
};

export default SignInForm;