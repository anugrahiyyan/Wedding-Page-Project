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
    tierId: z.string().optional(),
    price: z.coerce.number().optional(),
    description: z.string().optional(),
})

export async function createTemplate(prevState: string | undefined, formData: FormData) {
    const validatedFields = CreateTemplateSchema.safeParse({
        name: formData.get('name'),
        tierId: formData.get('tierId') || undefined,
        price: formData.get('price') || undefined,
        description: formData.get('description') || undefined,
    })

    if (!validatedFields.success) {
        return 'Invalid fields'
    }

    const { name, tierId, price, description } = validatedFields.data

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
                tierId: tierId || null,
                price: price || null,
                description: description || null,
            },
        })
    } catch (error) {
        console.error(error)
        return 'Database Error: Failed to create template.'
    }

    redirect(`/dashboard/templates/${template.id}`)
}

export async function updateTemplate(id: string, content: string, thumbnail?: string, htmlContent?: string) {
    try {
        await db.template.update({
            where: { id },
            data: {
                content,
                thumbnail: thumbnail || null,
                htmlContent: htmlContent || null,
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

// Invoice Actions
const CreateInvoiceSchema = z.object({
    customerName: z.string().min(1, 'Customer Name is required'),
    templateId: z.string().min(1, 'Template is required'),
    subdomain: z.string().min(1, 'Subdomain is required').regex(/^[a-z0-9-]+$/, 'Invalid subdomain format'),
    subdomainMode: z.enum(['VIP', 'BASIC']),
    agreedPrice: z.coerce.number().optional(),
})

export async function createInvoice(formData: FormData) {
    const validatedFields = CreateInvoiceSchema.safeParse({
        customerName: formData.get('customerName'),
        templateId: formData.get('templateId'),
        subdomain: formData.get('subdomain'),
        subdomainMode: formData.get('subdomainMode'),
        agreedPrice: formData.get('agreedPrice') || undefined,
    })

    if (!validatedFields.success) {
        return { success: false, error: 'Invalid fields' }
    }

    const { customerName, templateId, subdomain, subdomainMode, agreedPrice } = validatedFields.data

    // Generate simple access token
    const accessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    try {
        await db.invoice.create({
            data: {
                customerName,
                templateId,
                subdomain,
                subdomainMode,
                agreedPrice: agreedPrice || 0,
                accessToken,
                status: 'ACTIVE'
            },
        })
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/invoices')
        return { success: true }
    } catch (error) {
        console.error('Failed to create invoice:', error)
        return { success: false, error: 'Database Error: Failed to create invoice.' }
    }
}

export async function updateInvoice(formData: FormData) {
    const id = formData.get('id') as string;
    const validatedFields = CreateInvoiceSchema.safeParse({
        customerName: formData.get('customerName'),
        templateId: formData.get('templateId'),
        subdomain: formData.get('subdomain'),
        subdomainMode: formData.get('subdomainMode'),
        agreedPrice: formData.get('agreedPrice') || undefined,
    })

    if (!validatedFields.success) {
        return { success: false, error: 'Invalid fields' }
    }

    const { customerName, templateId, subdomain, subdomainMode, agreedPrice } = validatedFields.data

    try {
        await db.invoice.update({
            where: { id },
            data: {
                customerName,
                templateId,
                subdomain,
                subdomainMode,
                agreedPrice: agreedPrice || 0,
            },
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update invoice' }
    }
}

export async function updateInvoiceContent(id: string, content: string) {
    try {
        await db.invoice.update({
            where: { id },
            data: { templateContent: content }
        })
        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/invoices/${id}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update invoice content:', error)
        return { success: false, error: 'Failed to update content' }
    }
}

export async function deleteInvoice(id: string) {
    try {
        await db.invoice.delete({ where: { id } })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete invoice' }
    }
}

export async function toggleInvoiceStatus(id: string, status: string) {
    try {
        await db.invoice.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update status' }
    }
}

export async function updateInvoiceMode(id: string, mode: 'VIP' | 'BASIC') {
    try {
        await db.invoice.update({
            where: { id },
            data: { subdomainMode: mode }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update mode' }
    }
}

export async function deleteTemplate(id: string) {
    try {
        const invoicesUsingTemplate = await db.invoice.count({ where: { templateId: id } })
        if (invoicesUsingTemplate > 0) {
            return { success: false, error: `Cannot delete: Used by ${invoicesUsingTemplate} active invoice(s).` }
        }
        await db.template.delete({ where: { id } })
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/templates')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete template' }
    }
}

// Tier Actions
const CreateTierSchema = z.object({
    name: z.string().min(1),
    priceMin: z.coerce.number(),
    priceMax: z.coerce.number(),
    features: z.string().optional(),
    color: z.string().optional(),
    sortOrder: z.coerce.number().optional(),
})

export async function createTier(formData: FormData) {
    const validatedFields = CreateTierSchema.safeParse({
        name: formData.get('name'),
        priceMin: formData.get('priceMin'),
        priceMax: formData.get('priceMax'),
        features: formData.get('features'),
        color: formData.get('color'),
        sortOrder: formData.get('sortOrder'),
    })

    if (!validatedFields.success) return { success: false, error: 'Invalid fields' }

    try {
        await db.tier.create({ data: validatedFields.data })
        revalidatePath('/dashboard/tiers')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to create tier' }
    }
}

export async function updateTier(id: string, formData: FormData) {
    const validatedFields = CreateTierSchema.safeParse({
        name: formData.get('name'),
        priceMin: formData.get('priceMin'),
        priceMax: formData.get('priceMax'),
        features: formData.get('features'),
        color: formData.get('color'),
        sortOrder: formData.get('sortOrder'),
    })

    if (!validatedFields.success) return { success: false, error: 'Invalid fields' }

    try {
        await db.tier.update({ where: { id }, data: validatedFields.data })
        revalidatePath('/dashboard/tiers')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update tier' }
    }
}

export async function deleteTier(id: string) {
    try {
        // Optional: Check usage before delete
        await db.tier.delete({ where: { id } })
        revalidatePath('/dashboard/tiers')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete tier' }
    }
}

// User Actions

const CreateUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function createUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const validatedFields = CreateUserSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error);
        return { success: false, error: 'Invalid input' };
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
        revalidatePath('/dashboard/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function deleteUser(id: string) {
    try {
        await db.user.delete({
            where: { id },
        })
        revalidatePath('/dashboard/settings/users')
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

        revalidatePath('/dashboard/settings/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

export async function updatePassword(userId: string, current: string, newPass: string) {
    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: 'User not found' };

        // Verify current password
        const passwordMatch = await bcryptjs.compare(current, user.password);
        if (!passwordMatch) {
            return { success: false, error: 'Incorrect current password' };
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPass, 10);
        await db.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update password' };
    }
}
// [SKIPPED some unchanged lines] ...

// Subdomain Warm-up Action
export async function warmUpSubdomain(subdomain: string): Promise<{ success: boolean; message: string }> {
    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

    // For local development or VPS without subdomain DNS, we treat it as localhost path
    // OR we can explicitly try to hit the localhost:3000 with a Host header.

    const protocol = 'http'; // Internal ping is usually http on localhost
    const targetUrl = `${protocol}://localhost:3000`;

    try {
        console.log(`[Warm-up] Pinging ${targetUrl} with Host: ${subdomain}.${rootDomain}`);
        const response = await fetch(targetUrl, {
            method: 'HEAD',
            headers: {
                'Host': `${subdomain}.${rootDomain}`
            },
            cache: 'no-store'
        });

        console.log(`[Warm-up] Ping status: ${response.status}`);
        return {
            success: true,
            message: `Successfully pinged ${subdomain}.${rootDomain} (Status: ${response.status})`
        };
    } catch (error: any) {
        console.log(`[Warm-up] Failed to ping:`, error.message);
        return {
            success: false,
            message: `Failed to ping: ${error.message}`
        };
    }
}
