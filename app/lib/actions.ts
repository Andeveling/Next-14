"use server"
import { z } from "zod"
import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"

// Auth
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const credentials = Object.fromEntries(formData)
    await signIn("credentials", credentials)
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return "CredentialSignin"
    }
    throw error
  }
}

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: "Customer ID is required",
    invalid_type_error: "Customer ID expected.",
  }),
  amount: z.coerce.number().positive().min(1),
  status: z.enum(["pending", "paid"], {
    required_error: "Status is required",
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
})

// Create Invoice
const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  date: true,
})

// Update Invoice
const UpdateInvoiceSchema = InvoiceSchema.omit({
  date: true,
})

// Delete Invoice
const DeleteInvoiceSchema = InvoiceSchema.pick({
  id: true,
})

export const createInvoice = async (prevState: State, formData: FormData) => {
  // Validate form using Zod
  const validatedFields = CreateInvoiceSchema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  })
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    }
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = CreateInvoiceSchema.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  })
  const amountInCents = amount * 100
  const date = new Date().toISOString().split("T")[0]

  // Insert data into the database
  try {
    await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`
    revalidatePath("/dashboard/invoices")
    redirect("/dashboard/invoices")
  } catch (error) {
    // If a database error occurs, return a more specific error.

    return { message: "Database Error: Failed to create invoice" }
  } finally {
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath("/dashboard/invoices")
    redirect("/dashboard/invoices")
  }
}

export const updateInvoice = async (formData: FormData) => {
  const { id, customerId, amount, status } = UpdateInvoiceSchema.parse({
    id: formData.get("id"),
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  })
  const amountInCents = amount * 100
  try {
    await sql`UPDATE invoices 
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`
    revalidatePath("/dashboard/invoices")
  } catch (error) {
    return { message: "Database Error: Failed to update invoice" }
  } finally {
    redirect("/dashboard/invoices")
  }
}

export const deleteInvoice = async (formData: FormData) => {
  throw new Error("Failed to Delete Invoice")

  const { id } = DeleteInvoiceSchema.parse({
    id: formData.get("id"),
  })
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`
    revalidatePath("/dashboard/invoices")
  } catch (error) {
    return { message: "Database Error: Failed to delete invoice" }
  }
}
