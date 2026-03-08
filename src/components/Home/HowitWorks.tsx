import { motion } from 'framer-motion';
import { Search, Palette, Users, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Discover',
    description: 'Explore stunning portfolios and find designers that match your style and budget.',
    number: '01',
    variant: 'primary',
  },
  {
    icon: Palette,
    title: 'Post Your Project',
    description: 'Share your vision, upload photos of your space, and set your budget range.',
    number: '02',
    variant: 'secondary',
  },
  {
    icon: Users,
    title: 'Receive Proposals',
    description: 'Get personalized proposals from top designers with mood boards and quotes.',
    number: '03',
    variant: 'primary',
  },
  {
    icon: CheckCircle,
    title: 'Transform Your Space',
    description: 'Work with your chosen designer through our milestone-based system.',
    number: '04',
    variant: 'secondary',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-28 relative overflow-hidden">
      {/* Subtle background glows using brand colors */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-secondary/6 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary font-semibold text-xs uppercase tracking-widest">
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
          >
            How{' '}
            <span className="relative inline-block">
              Huduma<span className="text-secondary">link</span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute bottom-1 left-0 right-0 h-[3px] bg-secondary/40 rounded-full origin-left"
              />
            </span>{' '}
            Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg"
          >
            From inspiration to transformation, we make it effortless to bring your dream space to life.
          </motion.p>
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="flex flex-col gap-0 lg:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isPrimary = step.variant === 'primary';

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 relative"
              >
                {/* Timeline spine + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                      isPrimary
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-secondary/10 border-secondary/20'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isPrimary ? 'text-primary' : 'text-secondary'}`}
                    />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 mt-2 mb-2 bg-gradient-to-b from-border to-transparent min-h-[2rem]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 pt-1">
                  <span className="text-xs font-bold text-muted-foreground/40 tracking-widest">
                    {step.number}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1 mt-0.5">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Desktop: horizontal cards ── */}
        <div className="hidden lg:grid grid-cols-4 gap-5 relative">
          {/* Connector line */}
          <div className="absolute top-[3.25rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isPrimary = step.variant === 'primary';

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-3xl p-6 pt-8 text-center group transition-all cursor-default border ${
                  isPrimary
                    ? 'bg-primary/5 border-primary/15 hover:border-primary/30 hover:bg-primary/8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
                    : 'bg-secondary/5 border-secondary/15 hover:border-secondary/30 hover:bg-secondary/8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
                }`}
              >
                {/* Step number */}
                <span className="absolute top-4 left-4 text-xs font-bold text-muted-foreground/35 tracking-widest">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative inline-flex mb-5">
                  <div
                    className={`w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border ${
                      isPrimary
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-secondary/10 border-secondary/20'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${isPrimary ? 'text-primary' : 'text-secondary'}`}
                    />
                  </div>
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom accent on hover */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isPrimary ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}