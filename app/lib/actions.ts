"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const InvoiceSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(["pending", "paid"]),
	date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
	const { customerId, amount, status } = CreateInvoice.parse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	// using Object.Entries
	// const rawFormData2 = Object.fromEntries(formData.entries());
	// console.log(rawFormData2);

	// It's usually good practice to store monetary values in cents in
	// your database to eliminate JavaScript floating-point errors and
	// ensure greater accuracy.
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amount},${status},${date})
  `;
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}
