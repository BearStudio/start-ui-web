import { toast } from 'sonner';

export const onSubmit = (values: ExplicitAny) => {
  toast('You submitted the following values', {
    description: (
      <pre className="mt-2 w-[320px] rounded-md bg-black p-4">
        <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      </pre>
    ),
  });
};
