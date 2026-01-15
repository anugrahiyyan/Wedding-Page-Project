import { Template } from '@/types'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'

interface TemplateCardProps {
    item: Template;
}

function formatIDR(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} jt`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ item }) => {
    const { name, thumbnail, price, tier, id } = item

    // Use thumbnail or a placeholder
    const mainImage = thumbnail || '/images/placeholder-template.jpg';

    return (
        <div>
            <div className='relative rounded-2xl border border-dark/5 dark:border-white/10 group hover:shadow-3xl duration-300 dark:hover:shadow-white/5 dark:hover:border-primary/50 bg-white dark:bg-gray-900 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent backdrop-blur-sm'>
                <div className='overflow-hidden rounded-t-2xl aspect-[4/3] relative'>
                    <Link href={`/preview/${id}`}>
                        <Image
                            src={mainImage}
                            alt={name}
                            fill
                            className='object-cover group-hover:scale-110 transition duration-500'
                            unoptimized={true}
                        />
                    </Link>
                    <div className='absolute top-4 right-4 p-3 bg-white rounded-full hidden group-hover:block transition-all duration-300 shadow-md'>
                        <Icon
                            icon={'solar:arrow-right-linear'}
                            width={20}
                            height={20}
                            className='text-black'
                        />
                    </div>
                    {tier && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm" style={{ backgroundColor: tier.color || '#646cff' }}>
                            {tier.name}
                        </div>
                    )}
                </div>
                <div className='p-6'>
                    <div className='flex flex-col gap-2 mb-4'>
                        <Link href={`/preview/${id}`}>
                            <h3 className='text-xl font-medium text-black dark:text-white duration-300 group-hover:text-primary line-clamp-1'>
                                {name}
                            </h3>
                        </Link>
                    </div>
                    <div className='flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-4'>
                        <div className="flex flex-col">
                            <span className="text-xs text-black/50 dark:text-white/70">Price</span>
                            <span className="text-lg font-bold text-primary">
                                {price ? `IDR ${formatIDR(price)}` : (tier ? `IDR ${formatIDR(tier.priceMin)}+` : 'Custom')}
                            </span>
                        </div>
                        <Link href={`/preview/${id}`} className='text-sm font-medium text-dark dark:text-white hover:text-primary flex items-center gap-1'>
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TemplateCard
