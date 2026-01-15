import { Icon } from '@iconify/react'
import TemplateCard from './TemplateCard'
import { Template } from '@/types'

interface TemplateCatalogProps {
    templates: Template[];
}

const TemplateCatalog: React.FC<TemplateCatalogProps> = ({ templates }) => {
    return (
        <section className="py-20 bg-rose-50/30 dark:bg-transparent">
            <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
                <div className='mb-16 flex flex-col gap-3 items-center text-center'>
                    <div className='flex gap-2.5 items-center justify-center bg-primary/10 px-4 py-1.5 rounded-full w-fit'>
                        <Icon
                            icon={'solar:heart-bold'}
                            width={16}
                            height={16}
                            className='text-primary'
                        />
                        <p className='text-sm font-bold text-primary uppercase tracking-wider'>
                            Our Collection
                        </p>
                    </div>
                    <h2 className='text-40 lg:text-52 font-medium text-black dark:text-white tracking-tight leading-tight mb-2'>
                        Find your perfect invitation.
                    </h2>
                    <p className='text-lg font-normal text-black/50 dark:text-white/50 max-w-2xl'>
                        Choose from our exclusive range of digital wedding invitations, designed to make your special day even more memorable.
                    </p>
                </div>

                {templates.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-black/50 dark:text-white/50">No templates found.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {templates.map((item) => (
                            <div key={item.id}>
                                <TemplateCard item={item} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default TemplateCatalog
