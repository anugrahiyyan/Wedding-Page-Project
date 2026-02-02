'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import bcryptjs from 'bcryptjs'
import { DEFAULT_FILES } from './template-defaults'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        // CSRF Protection: Validate origin for login action
        const headersList = await headers();
        const origin = headersList.get('origin');
        const referer = headersList.get('referer');
        const host = headersList.get('host') || '';
        const rootDomain = process.env.ROOT_DOMAIN || '';

        // Check if origin is trusted
        const requestOrigin = origin || (referer ? new URL(referer).origin : null);
        if (requestOrigin) {
            const originHost = new URL(requestOrigin).host;
            const isTrusted =
                originHost === host ||
                originHost === 'localhost:3000' ||
                originHost === rootDomain ||
                originHost.endsWith(`.${rootDomain.replace(/:\d+$/, '')}`);

            if (!isTrusted) {
                console.warn(`[CSRF] Login blocked from untrusted origin: ${requestOrigin}`);
                return 'Invalid request origin.';
            }
        }

        const data = Object.fromEntries(formData);
        console.log('Login attempt for:', data.username);

        // Determine base URL: specific env var > inferred from headers > default
        let baseUrl = process.env.AUTH_URL;
        if (!baseUrl) {
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

    // Use centralized DEFAULT_FILES from file-actions.ts
    // Extract index.html content for htmlContent field
    const indexFile = DEFAULT_FILES.find(f => f.name === 'index.html');
    const defaultHtml = indexFile?.content || '';

    let template;
    try {
        template = await db.template.create({
            data: {
                name,
                content: JSON.stringify(DEFAULT_FILES), // VFS structure
                htmlContent: defaultHtml,
                tierId: tierId || null,
                price: price || null,
                description: description || null,
            },
        })
    } catch (error) {
        console.error(error)
        return 'Database Error: Failed to create template.'
    }

    // Revalidate cached pages to show new template
    revalidatePath('/');
    revalidatePath('/dashboard/templates');

    redirect(`/editor/${template.id}`)
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

    // Generate 6-digit numeric PIN
    const accessToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Get template HTML to initialize invoice HTML
    const template = await db.template.findUnique({ where: { id: templateId } });
    const htmlContent = template?.htmlContent || '';

    try {
        await db.invoice.create({
            data: {
                customerName,
                templateId,
                subdomain,
                subdomainMode,
                agreedPrice: agreedPrice || 0,
                accessToken,
                htmlContent,
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
            data: { htmlContent: content }
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
        // Manually cascade delete RSVPs first (since schema might lack onDelete: Cascade)
        await db.rsvpSubmission.deleteMany({
            where: { invoiceId: id }
        });

        await db.invoice.delete({ where: { id } })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete invoice:', error);
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
