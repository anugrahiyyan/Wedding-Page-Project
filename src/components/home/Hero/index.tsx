import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'

const Hero: React.FC = () => {
  return (
    <section className='!py-0'>
      <div className='bg-gradient-to-b from-skyblue via-lightskyblue dark:via-[#4298b0] to-white/10 dark:to-black/10 overflow-hidden relative'>
        <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-60 md:pb-68'>
          <div className='relative text-white dark:text-dark text-center md:text-start z-10'>
            <p className='text-inherit text-xm font-medium'>Online Wedding Invitations</p>
            <h1 className='text-inherit text-5xl sm:text-8xl font-semibold -tracking-wider md:max-w-45p mt-4 mb-6'>
              Share Your Special Moment
            </h1>
            <div className='flex flex-col xs:flex-row justify-center md:justify-start gap-4'>
              <Link href="https://wa.me/6281230826731" target="_blank" className='px-8 py-4 border border-white dark:border-dark bg-white dark:bg-dark text-dark dark:text-white duration-300 dark:hover:text-dark hover:bg-transparent hover:text-white text-base font-semibold rounded-full hover:cursor-pointer'>
                Order Now
              </Link>
              <Link href="#templates" className='px-8 py-4 border border-white dark:border-dark bg-transparent text-white dark:text-dark hover:bg-white dark:hover:bg-dark dark:hover:text-white hover:text-dark duration-300 text-base font-semibold rounded-full hover:cursor-pointer'>
                View Templates
              </Link>
            </div>
          </div>
          <div className='hidden md:block absolute top-25 right-0 lg:right-50 w-[320px] h-[480px]'>
            {/* Card 1: Romeo & Juliet */}
            <div className="absolute inset-0 w-full h-full bg-[#fffbf7] dark:bg-card-bg rounded-t-[10rem] rounded-b-xl shadow-3xl border-[12px] border-white dark:border-dark/50 overflow-hidden animate-shuffle origin-bottom" style={{ animationDelay: '0s' }}>
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
              <div className="absolute inset-3 border border-dark/20 dark:border-white/20 rounded-t-[9rem] rounded-b-lg flex flex-col items-center justify-center text-center p-6 mt-2">
                <p className="text-sm uppercase tracking-[0.3em] mb-6 text-dark/70 dark:text-white/70">The Wedding Of</p>
                <div className="font-[family-name:Great_Vibes,cursive]" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  <p className="text-6xl text-primary mb-2">Romeo</p>
                  <p className="text-3xl text-dark/40 dark:text-white/40 my-2">&</p>
                  <p className="text-6xl text-primary mb-8">Juliet</p>
                </div>
                <div className="w-12 h-0.5 bg-primary/30 mb-8"></div>
                <div className="text-dark/80 dark:text-white/80 font-[family-name:Cinzel,serif]" style={{ fontFamily: '"Cinzel", serif' }}>
                  <p className="mb-1 text-lg">Saturday</p>
                  <p className="text-xl font-bold mb-1">DEC 12</p>
                  <p className="text-sm text-dark/60 dark:text-white/60">AT 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Card 2: Adam & Eve */}
            <div className="absolute inset-0 w-full h-full bg-[#fffbf7] dark:bg-card-bg rounded-t-[10rem] rounded-b-xl shadow-3xl border-[12px] border-white dark:border-dark/50 overflow-hidden animate-shuffle origin-bottom" style={{ animationDelay: '-2s' }}>
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
              <div className="absolute inset-3 border border-dark/20 dark:border-white/20 rounded-t-[9rem] rounded-b-lg flex flex-col items-center justify-center text-center p-6 mt-2">
                <p className="text-sm uppercase tracking-[0.3em] mb-6 text-dark/70 dark:text-white/70">The Wedding Of</p>
                <div className="font-[family-name:Great_Vibes,cursive]" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  <p className="text-6xl text-primary mb-2">Adam</p>
                  <p className="text-3xl text-dark/40 dark:text-white/40 my-2">&</p>
                  <p className="text-6xl text-primary mb-8">Eve</p>
                </div>
                <div className="w-12 h-0.5 bg-primary/30 mb-8"></div>
                <div className="text-dark/80 dark:text-white/80 font-[family-name:Cinzel,serif]" style={{ fontFamily: '"Cinzel", serif' }}>
                  <p className="mb-1 text-lg">Monday</p>
                  <p className="text-xl font-bold mb-1">JAN 01</p>
                  <p className="text-sm text-dark/60 dark:text-white/60">AT 10:00 AM</p>
                </div>
              </div>
            </div>

            {/* Card 3: Rose & Jack */}
            <div className="absolute inset-0 w-full h-full bg-[#fffbf7] dark:bg-card-bg rounded-t-[10rem] rounded-b-xl shadow-3xl border-[12px] border-white dark:border-dark/50 overflow-hidden animate-shuffle origin-bottom" style={{ animationDelay: '-4s' }}>
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
              <div className="absolute inset-3 border border-dark/20 dark:border-white/20 rounded-t-[9rem] rounded-b-lg flex flex-col items-center justify-center text-center p-6 mt-2">
                <p className="text-sm uppercase tracking-[0.3em] mb-6 text-dark/70 dark:text-white/70">The Wedding Of</p>
                <div className="font-[family-name:Great_Vibes,cursive]" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  <p className="text-6xl text-primary mb-2">Rose</p>
                  <p className="text-3xl text-dark/40 dark:text-white/40 my-2">&</p>
                  <p className="text-6xl text-primary mb-8">Jack</p>
                </div>
                <div className="w-12 h-0.5 bg-primary/30 mb-8"></div>
                <div className="text-dark/80 dark:text-white/80 font-[family-name:Cinzel,serif]" style={{ fontFamily: '"Cinzel", serif' }}>
                  <p className="mb-1 text-lg">Wednesday</p>
                  <p className="text-xl font-bold mb-1">FEB 14</p>
                  <p className="text-sm text-dark/60 dark:text-white/60">AT 7:00 PM</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            {/* Paper Plane - Flying Animation */}
            <div className="absolute -top-12 -left-20 text-primary opacity-60 animate-fly z-40">
              <Icon icon="solar:plain-bold" width={64} height={64} />
            </div>

            {/* QR Code - Floating Animation */}
            <div className="absolute -bottom-10 -left-16 bg-white dark:bg-card-bg p-3 rounded-xl shadow-xl animate-float-slow z-40 rotate-12">
              <Icon icon="solar:qr-code-bold" width={48} height={48} className="text-dark dark:text-white" />
            </div>

            {/* Heart - Floating Animation Reverse */}
            <div className="absolute -right-8 bottom-32 text-red-400 opacity-80 animate-float z-40" style={{ animationDelay: '1s' }}>
              <Icon icon="solar:heart-bold" width={42} height={42} />
            </div>
          </div>
        </div>
      </div>
      <div className='md:absolute bottom-0 md:-right-68 xl:right-0 bg-white dark:bg-black py-12 px-8 mobile:px-16 md:pl-16 md:pr-[295px] rounded-2xl md:rounded-none md:rounded-tl-2xl mt-24'>
        <div className='grid grid-cols-2 sm:grid-cols-4 md:flex gap-16 md:gap-24 sm:text-center dark:text-white text-black'>
          <div className='flex flex-col sm:items-center gap-3'>
            <p className='text-2xl sm:text-3xl font-medium text-inherit'>
              50+
            </p>
            <p className='text-sm sm:text-base font-normal text-black/50 dark:text-white/50'>
              Designs
            </p>
          </div>
          <div className='flex flex-col sm:items-center gap-3'>
            <p className='text-2xl sm:text-3xl font-medium text-inherit'>
              Fast
            </p>
            <p className='text-sm sm:text-base font-normal text-black/50 dark:text-white/50'>
              Process
            </p>
          </div>
          <div className='flex flex-col sm:items-center gap-3'>
            <p className='text-2xl sm:text-3xl font-medium text-inherit'>
              Mobile
            </p>
            <p className='text-sm sm:text-base font-normal text-black/50 dark:text-white/50'>
              Friendly
            </p>
          </div>
          <div className='flex flex-col sm:items-center gap-3'>
            <p className='text-2xl sm:text-3xl font-medium text-inherit'>
              Best
            </p>
            <p className='text-sm sm:text-base font-normal text-black/50 dark:text-white/50'>
              Price
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
