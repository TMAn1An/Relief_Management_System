import { Field, Input } from "@/components/ui";

export function VerifyFields({ errors, values }: { errors?: Record<string, string[] | undefined>; values?: Record<string, string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="NID number" name="nid" error={errors?.nid}>
        <Input name="nid" inputMode="numeric" maxLength={10} defaultValue={values?.nid} required error={errors?.nid} />
      </Field>
      <Field label="Mobile number" name="phone" error={errors?.phone} hint="The number you applied with">
        <Input name="phone" type="tel" inputMode="tel" maxLength={11} defaultValue={values?.phone} required error={errors?.phone} />
      </Field>
    </div>
  );
}
