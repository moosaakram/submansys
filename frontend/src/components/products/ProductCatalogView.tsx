'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Product, ProductType, ProductVariant } from '@/types/subscription';

export default function ProductCatalogView() {
  const { products, addProduct, currentUser } = useSubscription();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [productType, setProductType] = useState<ProductType>('software');
  const [salesPrice, setSalesPrice] = useState('299.00');
  const [costPrice, setCostPrice] = useState('45.00');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([
    { name: 'Standard Edition', attribute: 'Brand', priceDelta: 0 },
  ]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || p.productType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { name: 'Odoo Ecosystem Integration', attribute: 'Brand', priceDelta: 560 },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof Omit<ProductVariant, 'id'>,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedVariants: ProductVariant[] = variants.map((v, idx) => ({
      id: `var-${Date.now()}-${idx}`,
      name: v.name,
      attribute: v.attribute,
      priceDelta: Number(v.priceDelta) || 0,
    }));

    addProduct({
      name,
      productType,
      salesPrice: parseFloat(salesPrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      description,
      notes,
      variants: formattedVariants,
      isActive: true,
    });

    // Reset
    setName('');
    setDescription('');
    setNotes('');
    setVariants([{ name: 'Standard Edition', attribute: 'Brand', priceDelta: 0 }]);
    setIsModalOpen(false);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Package className="h-3.5 w-3.5" />
            <span>Scene 2: Product & Variant Management</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Products & Variants
          </h2>
          <p className="text-xs text-slate-500">
            Manage software catalog items, cost prices, and add-on brand variants (e.g., Odoo Brand +$560).
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, descriptions, variants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="software">Software Platforms</option>
            <option value="addon">Add-ons</option>
            <option value="service">Services & SLA</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((p) => {
          const margin = p.salesPrice - p.costPrice;
          const marginPercent = p.salesPrice > 0 ? Math.round((margin / p.salesPrice) * 100) : 0;

          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.productType === 'software'
                        ? 'bg-blue-100 text-blue-700'
                        : p.productType === 'addon'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {p.productType}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {marginPercent}% Margin
                  </span>
                </div>

                <h3 className="mt-3 font-bold text-slate-900 text-base">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {p.description || 'Enterprise catalog software item.'}
                </p>

                {/* Pricing summary */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Sales Price</span>
                    <span className="text-sm font-bold text-slate-900">${p.salesPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Cost Price</span>
                    <span className="text-xs font-semibold text-slate-600">${p.costPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Variants List (Scene 2 requirement) */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Available Variants:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {p.variants.length} available
                    </span>
                  </div>

                  {p.variants.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">No variants configured</div>
                  ) : (
                    <div className="space-y-1.5">
                      {p.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg bg-indigo-50/50 px-2.5 py-1.5 text-xs text-indigo-950"
                        >
                          <span className="font-medium truncate">{v.name}</span>
                          <span className="font-bold text-indigo-700 shrink-0">
                            {v.priceDelta > 0 ? `+$${v.priceDelta.toFixed(2)}` : 'Standard'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {p.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 italic">Note: {p.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Product with Variants */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Scene 2: Admin Product Setup
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Launch New Product</h3>
              <p className="text-xs text-slate-500">
                Define the sales price, internal cost, description, and variant price deltas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cloud ERP Suite"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classification Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="software">Software</option>
                    <option value="addon">Add-on</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sales Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product features..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal ops notes..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Variant Rows Configuration */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Product Variants & Surcharges
                    </span>
                    <span className="text-[10px] text-slate-500">
                      e.g., Odoo Brand adds $560 to price
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variant Name (e.g. Odoo Brand)"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Attribute (e.g. Brand)"
                        value={v.attribute}
                        onChange={(e) => handleUpdateVariant(idx, 'attribute', e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-hidden"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-slate-400">+$</span>
                        <input
                          type="number"
                          placeholder="560"
                          value={v.priceDelta}
                          onChange={(e) =>
                            handleUpdateVariant(idx, 'priceDelta', parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-hidden"
                        />
                      </div>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

