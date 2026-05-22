import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ShoppingCart,
  Tag,
  PhoneCall,
  MessageSquare,
  Check,
  Sparkles,
  MapPin,
  TrendingUp,
  TrendingDown,
  Building2,
  ExternalLink,
  FileText,
  X,
  Star,
  Users
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui'

// Mock supplier catalog data
const MARKET_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Bio-Grow Broiler Starter Crumble',
    category: 'Feed',
    price: 38.50,
    unit: '50kg Bag',
    rating: 4.8,
    reviews: 124,
    supplier: 'FeedCo Ag Solutions',
    location: 'Midwest Distribution Hub',
    description: 'High-protein initial diet designed for day 1-14 broilers. Optimizes gut development and early skeletal growth.',
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Premium Layer Feed Concentrate',
    category: 'Feed',
    price: 42.00,
    unit: '50kg Bag',
    rating: 4.9,
    reviews: 89,
    supplier: 'NutriAgri Feeds',
    location: 'Southeast Regional Center',
    description: '16% protein blend enriched with organic calcium and minerals for high laying rates and durable eggshell quality.',
    available: true,
  },
  {
    id: 'prod-3',
    name: 'Newcastle & Bronchitis Vaccine B1 Strain',
    category: 'Medicines',
    price: 115.00,
    unit: '1000 Doses',
    rating: 4.7,
    reviews: 56,
    supplier: 'MedVet Biologicals',
    location: 'National Cold-Chain Depot',
    description: 'Live virus vaccine for immunizing healthy chickens against Newcastle Disease and Infectious Bronchitis.',
    available: true,
  },
  {
    id: 'prod-4',
    name: 'Smart Nipple Drinking Water Line (4m)',
    category: 'Equipment',
    price: 165.00,
    unit: 'Section',
    rating: 4.6,
    reviews: 32,
    supplier: 'IoT Farm Products Inc.',
    location: 'West Coast Logistics',
    description: 'Stainless steel 360-degree drip-free nipple drinkers. Integrated pressure regulators prevent moisture buildup.',
    available: true,
  },
  {
    id: 'prod-5',
    name: 'Day-Old Cobb 500 Broiler Chicks',
    category: 'Livestock',
    price: 1.15,
    unit: 'Per Chick (Min. 500)',
    rating: 4.9,
    reviews: 210,
    supplier: 'Cobb Hatcheries North America',
    location: 'Hatchery West (Local Pickup)',
    description: 'Premium genetics. Documented high growth rates, superior feed conversion ratios, and strong immune profiles.',
    available: true,
  },
  {
    id: 'prod-6',
    name: 'Automatic Auger Feed Dispenser 20kg',
    category: 'Equipment',
    price: 320.00,
    unit: 'Unit',
    rating: 4.5,
    reviews: 47,
    supplier: 'Apex Farm Automation',
    location: 'Midwest Distribution Hub',
    description: 'Heavy duty motor, scheduled smart dispensing. Connects to standard IoT controllers or operates stand-alone.',
    available: true,
  },
]

// Commodities Indices Mock Data
const COMMODITY_INDEX = [
  { name: 'Live Broiler (Farmgate)', price: '$2.38 / kg', change: '+1.4%', up: true },
  { name: 'Large White Eggs', price: '$3.12 / doz', change: '-0.6%', up: false },
  { name: 'Soybean Meal (48%)', price: '$405.50 / ton', change: '+0.9%', up: true },
  { name: 'Yellow Feed Maize', price: '$4.78 / bu', change: '+1.8%', up: true },
]

export default function FarmMarketplace() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quoteProduct, setQuoteProduct] = useState(null)
  
  // Quote form state
  const [quoteQty, setQuoteQty] = useState(10)
  const [quoteMsg, setQuoteMsg] = useState('')

  // Categories list
  const categories = ['All', 'Feed', 'Medicines', 'Equipment', 'Livestock']

  // Filter products
  const filteredProducts = useMemo(() => {
    return MARKET_PRODUCTS.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.supplier.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [search, selectedCategory])

  const handleOpenQuoteModal = (product) => {
    setQuoteProduct(product)
    setQuoteQty(product.category === 'Livestock' ? 500 : 10)
    setQuoteMsg(`Hello ${product.supplier},\nI would like to request a pricing quotation for ${product.category === 'Livestock' ? '500' : '10'} units of ${product.name}. Please provide availability and shipping estimates to our farm location.`)
  }

  const handleSubmitQuote = (e) => {
    e.preventDefault()
    showToast(`Quote request successfully sent to ${quoteProduct.supplier}!`, 'success')
    setQuoteProduct(null)
  }

  return (
    <AppShell title="Farm Marketplace" subtitle="Procure high-quality feed, certified veterinary supplies, IoT hardware, and check live agricultural commodity rates">
      
      {/* Live Commodities Ticker */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMMODITY_INDEX.map((index, idx) => (
          <div key={idx} className="rounded-2xl border border-white/70 bg-white/75 p-4.5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">{index.name}</span>
              <p className="font-heading text-xl font-black text-surface-950 dark:text-white">
                {index.price}
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
              index.up 
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            )}>
              {index.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {index.change}
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Search & Filters */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-surface-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search feed, medicines, equipment, hatcheries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-surface-200/80 bg-white/60 pl-10 pr-4 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-950"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-extrabold transition",
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                  : "bg-white/50 text-surface-650 hover:bg-white border border-surface-200/50 dark:bg-white/5 dark:text-slate-350 dark:border-white/5 dark:hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            className="rounded-2xl border border-white/70 bg-white/70 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300"
          >
            {/* Upper Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Tag className="h-3 w-3" />
                  {product.category}
                </span>
                
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.rating} <span className="text-surface-400 dark:text-slate-500 font-semibold">({product.reviews})</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-base font-black text-surface-950 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-[10px] text-surface-450 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {product.supplier}
                </p>
              </div>

              <p className="text-xs text-surface-555 dark:text-slate-350 leading-relaxed font-semibold">
                {product.description}
              </p>

              <div className="flex items-center gap-1.5 text-[10px] text-surface-450 dark:text-slate-400 font-bold border-t border-surface-200/50 pt-3 dark:border-white/5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                {product.location}
              </div>
            </div>

            {/* Price & Action Section */}
            <div className="px-6 py-4.5 bg-surface-50/50 border-t border-surface-200/50 dark:bg-white/[0.02] dark:border-white/5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-bold text-surface-450 dark:text-slate-550 block uppercase">Est. Wholesale</span>
                <p className="font-heading text-lg font-black text-surface-900 dark:text-white">
                  ${product.price.toFixed(2)} <span className="text-xs text-surface-500 font-semibold">/ {product.unit}</span>
                </p>
              </div>

              <button
                onClick={() => handleOpenQuoteModal(product)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 text-xs font-black shadow-md shadow-emerald-950/10 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Request Quote
              </button>
            </div>

          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-surface-200/60 dark:border-white/5">
            <ShoppingCart className="h-10 w-10 text-surface-400 dark:text-slate-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold">No marketplace listings match search criteria</p>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-1">Try selecting another category or check your spelling.</p>
          </div>
        )}
      </div>

      {/* Request Quote Modal */}
      {quoteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-200/50 pb-4 dark:border-white/5">
              <div>
                <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
                  Request Supplier Quotation
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5">
                  Direct inquiry to <span className="font-bold text-emerald-600 dark:text-emerald-450">{quoteProduct.supplier}</span>
                </p>
              </div>
              <button
                onClick={() => setQuoteProduct(null)}
                className="p-1 rounded-lg hover:bg-surface-100 text-surface-500 dark:hover:bg-white/5 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">
                  Product
                </label>
                <div className="p-3 bg-surface-50 dark:bg-white/5 rounded-xl text-xs font-black text-surface-900 dark:text-white border border-surface-200/50 dark:border-white/5">
                  {quoteProduct.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">
                    Required Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoteQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setQuoteQty(val)
                      setQuoteMsg(prev => prev.replace(/(\b\d+\b)(?=\s+units)/g, String(val)))
                    }}
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">
                    Packaging Unit
                  </label>
                  <div className="h-10 leading-[40px] px-3 bg-surface-50 dark:bg-white/5 rounded-xl text-xs font-semibold text-surface-500 dark:text-slate-400 border border-surface-200/50 dark:border-white/5">
                    {quoteProduct.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">
                  Message Details
                </label>
                <textarea
                  rows="4"
                  required
                  value={quoteMsg}
                  onChange={(e) => setQuoteMsg(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white p-3 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-surface-450 dark:text-slate-400 font-bold bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-emerald-500 animate-pulse" />
                  AgriOS Secure Gateway Verified Supplier
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuoteProduct(null)}
                  className="flex-1 h-10 rounded-xl border border-surface-200 text-surface-700 font-extrabold text-xs hover:bg-surface-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-950/15 transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="h-4 w-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  )
}
