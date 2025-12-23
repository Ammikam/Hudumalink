import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { roomTypes, roomSizes, designStyles, formatCurrency } from '../../data/MockData';
import { cn } from '../../lib/utils';

export function QuoteCalculator() {
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [roomSize, setRoomSize] = useState(roomSizes[1]);
  const [style, setStyle] = useState(designStyles[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  const priceRange = useMemo(() => {
    const basePrice = roomType.basePrice;
    const sizeMultiplier = roomSize.multiplier;
    const styleMultiplier = style.multiplier;

    const minPrice = Math.round(basePrice * sizeMultiplier * styleMultiplier * 0.85);
    const maxPrice = Math.round(basePrice * sizeMultiplier * styleMultiplier * 1.15);

    return { min: minPrice, max: maxPrice };
  }, [roomType, roomSize, style]);

  return (
    <motion.div
      layout
      className="card-elevated p-6 lg:p-8"
    >
      <div
        className="flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Quick Quote Calculator
            </h3>
            <p className="text-sm text-muted-foreground">
              Get an instant estimate for your project
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground lg:hidden transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded || window.innerWidth >= 1024 ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Room Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Room Type
              </label>
              <div className="relative">
                <select
                  value={roomType.value}
                  onChange={(e) => setRoomType(roomTypes.find(r => r.value === e.target.value)!)}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
                >
                  {roomTypes.map((room) => (
                    <option key={room.value} value={room.value}>
                      {room.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Room Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Room Size
              </label>
              <div className="relative">
                <select
                  value={roomSize.value}
                  onChange={(e) => setRoomSize(roomSizes.find(r => r.value === e.target.value)!)}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
                >
                  {roomSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Design Style
              </label>
              <div className="relative">
                <select
                  value={style.value}
                  onChange={(e) => setStyle(designStyles.find(s => s.value === e.target.value)!)}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
                >
                  {designStyles.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Result */}
          <motion.div
            key={`${roomType.value}-${roomSize.value}-${style.value}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-primary text-primary-foreground"
          >
            <p className="text-sm opacity-80 mb-1">Estimated Budget Range</p>
            <p className="font-display text-3xl lg:text-4xl font-bold">
              {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}
            </p>
            <p className="text-sm opacity-80 mt-2">
              Based on current market rates for {roomType.label.toLowerCase()} design in Kenya
            </p>
          </motion.div>

          <Button variant="terracotta" size="lg" className="w-full">
            Get Detailed Quote from Designers
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
