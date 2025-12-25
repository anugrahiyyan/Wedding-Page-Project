'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import bcryptjs from 'bcryptjs'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        const data = Object.fromEntries(formData);
        console.log('Login attempt for:', data.username);

        // Determine base URL: specific env var > inferred from headers > default
        let baseUrl = process.env.AUTH_URL;
        if (!baseUrl) {
            const headersList = await headers();
            const host = headersList.get('host');
            const proto = headersList.get('x-forwarded-proto') || 'http';
            if (host) baseUrl = `${proto}://${host}`;
        }

        const redirectTo = baseUrl ? `${baseUrl}/dashboard` : '/dashboard';
        console.log('Redirecting to:', redirectTo);

        await signIn('credentials', {
            username: data.username,
            password: data.password,
            redirectTo,
        })
    } catch (error) {
        // Check for Next.js Redirect error
        if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error('Sign in error:', error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

const CreateTemplateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
})

export async function createTemplate(prevState: string | undefined, formData: FormData) {
    const validatedFields = CreateTemplateSchema.safeParse({
        name: formData.get('name'),
    })

    if (!validatedFields.success) {
        return 'Invalid fields'
    }

    const { name } = validatedFields.data

    const defaultContent = JSON.stringify({
        hero: {
            title: "Welcome to Our Wedding",
            subtitle: "Jane & John • Dec 25, 2025",
            backgroundImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        countdown: {
            targetDate: "2025-12-25T16:00:00",
            message: "Counting down the days!"
        },
        story: {
            title: "Our Story",
            text: "We met at a coffee shop on a rainy Tuesday. One cup of latte later, we knew it was forever. Join us as we celebrate our love."
        },
        gallery: {
            title: "Our Moments",
            images: [
                "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"
            ]
        },
        event: {
            date: "December 25, 2025",
            time: "4:00 PM",
            location: "The Grand Hotel, New York",
            address: "123 Broadway, NY 10001",
            mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968459391!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1sen!2sus!4v1560412335448!5m2!1sen!2sus"
        },
        rsvp: {
            email: "rsvp@example.com",
            deadline: "December 1, 2025",
            showAllergyField: true
        },
        gifts: {
            show: true,
            items: [
                { type: "Bank", name: "BCA", number: "1234567890", accountName: "Jane Doe" },
                { type: "E-Wallet", name: "OVO", number: "08123456789", accountName: "John Doe" }
            ]
        },
        music: {
            youtubeId: "jfKfPfyJRdk",
            autoPlay: true
        }
    }, null, 2)

    let template;
    try {
        template = await db.template.create({
            data: {
                name,
                content: defaultContent,
            },
        })
    } catch (error) {
        console.error(error)
        return 'Database Error: Failed to create template.'
    }

    redirect(`/dashboard/templates/${template.id}`)
}

export async function updateTemplate(id: string, content: string, thumbnail?: string) {
    try {
        await db.template.update({
            where: { id },
            data: {
                content,
                thumbnail: thumbnail || null,
            },
        })
        revalidatePath(`/preview/${id}`)
        revalidatePath(`/dashboard/templates/${id}`)
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update' }
    }
}

// User Actions

const CreateUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function createUser(formData: FormData): Promise<void> {
    const validatedFields = CreateUserSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error);
        return;
    }

    const { username, password } = validatedFields.data

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'ADMIN',
            },
        })
        revalidatePath('/dashboard/users')
    } catch (error) {
        console.error('Failed to create user:', error);
    }
}

export async function deleteUser(id: string) {
    try {
        await db.user.delete({
            where: { id },
        })
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
    }
}

// Update User Action
export async function updateUser(id: string, username: string, password?: string) {
    try {
        const data: any = { username };
        if (password && password.length > 0) {
            if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
            data.password = await bcryptjs.hash(password, 10);
        }

        await db.user.update({
            where: { id },
            data,
        });

        revalidatePath('/dashboard/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

// Update Password Action
export async function updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const isValid = await bcryptjs.compare(currentPassword, user.password);
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await db.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to update password:', error);
        return { success: false, error: 'Failed to update password' };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await db.template.delete({
            where: { id },
        })
        revalidatePath('/dashboard')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
    }
}

// Invoice Actions

const CreateInvoiceSchema = z.object({
    customerName: z.string().min(1, 'Customer Name is required'),
    subdomain: z.string().min(3, 'Subdomain must be 3+ chars').regex(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric'),
    templateId: z.string().min(1, 'Template is required'),
})

export async function createInvoice(formData: FormData): Promise<void> {
    const validatedFields = CreateInvoiceSchema.safeParse({
        customerName: formData.get('customerName'),
        subdomain: formData.get('subdomain'),
        templateId: formData.get('templateId'),
    })

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error);
        return;
    }

    const { customerName, subdomain, templateId } = validatedFields.data

    try {
        // Fetch template to copy its content
        const template = await db.template.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            console.error('Template not found');
            return;
        }

        // Generate 6-digit access token
        const accessToken = Math.floor(100000 + Math.random() * 900000).toString();

        await db.invoice.create({
            data: {
                customerName,
                subdomain,
                templateId,
                templateContent: template.content, // Copy template content
                accessToken,
            },
        })
        revalidatePath('/dashboard/invoices')
    } catch (error) {
        console.error('Failed to create invoice:', error);
    }
}

// Archive Action
export async function toggleInvoiceStatus(id: string, newStatus: 'ACTIVE' | 'ARCHIVED') {
    try {
        await db.invoice.update({
            where: { id },
            data: { status: newStatus }
        })
        revalidatePath('/dashboard/invoices')
        revalidatePath('/dashboard/history')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to update status' }
    }
}

// Delete Action
export async function deleteInvoice(id: string) {
    try {
        await db.invoice.delete({
            where: { id },
        })
        revalidatePath('/dashboard/invoices')
        revalidatePath('/dashboard/history')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete invoice' }
    }
}

// Update Invoice Content
export async function updateInvoiceContent(id: string, templateContent: string) {
    try {
        const invoice = await db.invoice.findUnique({ where: { id } });
        if (!invoice) return { success: false, error: 'Invoice not found' };

        await db.invoice.update({
            where: { id },
            data: { templateContent }
        })
        revalidatePath('/dashboard/invoices')
        revalidatePath(`/s/${invoice.subdomain}`)
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to update' }
    }
}
