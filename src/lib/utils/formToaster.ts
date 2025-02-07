import { z } from 'zod';

import { addToast } from '$lib/components/toaster';

const formSchema = z.object({
	success: z.boolean(),
	message: z.string().optional().nullable()
});

type Form = z.infer<typeof formSchema>;

interface Options {
	callback?: (form: Form) => void;
}

export function handleForm(unparsedForm: unknown, successMessage?: string, options?: Options) {
	if (unparsedForm === null) return;

	const form: Form = formSchema.parse(unparsedForm);

	if (!form.success) {
		return;
	}

	if (options?.callback) {
		options.callback(form);
	}

	if (form !== null && form !== undefined) {
		if (form.success) {
			addToast({
				type: 'success',
				message: form.message || successMessage || 'success!',
				life: 3000
			});
		} else {
			addToast({
				type: 'error',
				message: form.message || 'An error occurred!',
				life: 3000
			});
		}
	}
}
