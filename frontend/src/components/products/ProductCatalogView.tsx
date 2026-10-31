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
  Edit2,
  Trash2,
} from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Product, ProductType, ProductVariant } from '@/types/subscription';

export default function ProductCatalogView() {
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useSubscription();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<ProductType>('software');
  const [editSalesPrice, setEditSalesPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditType(p.productType);
    setEditSalesPrice(String(p.salesPrice));
    setEditCostPrice(String(p.costPrice));
    setEditDesc(p.description || '');
    setEditNotes(p.notes || '');
    setEditVariants(p.variants || []);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    updateProduct(editingProduct.id, {
      name: editName,
      productType: editType,
      salesPrice: parseFloat(editSalesPrice) || 0,
      costPrice: parseFloat(editCostPrice) || 0,
      description: editDesc,
      notes: editNotes,
      variants: editVariants,
    });

    setEditingProduct(null);
  };


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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
            <Package className="h-3 w-3" />
            <span>Scene 2: Product & Variant Management</span>
          </div>
          <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl font-bold tracking-tight text-slate-900">
            Products & Variants
          </h2>
          <div className="title-accent-rule" />
          <p className="mt-0.5 text-xs text-slate-500">
            Manage software catalog items, cost prices, and add-on brand variants (e.g., Odoo Brand +$560).
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-gold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between card-surface p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, descriptions, variants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
              className="card-surface p-5 flex flex-col justify-between hover:border-[#c9ab70]/40 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.productType === 'software'
                        ? 'bg-slate-100 text-[#1c2530] border border-slate-200'
                        : p.productType === 'addon'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {p.productType}
                  </span>
                  <span className="badge-success">
                    {marginPercent}% Margin
                  </span>
                </div>

                <h3 className="mt-3 font-bold text-slate-900 text-base">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {p.description || 'Enterprise catalog software item.'}
                </p>

                {/* Pricing summary */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Sales Price</span>
                    <span className="font-[family-name:var(--font-serif)] text-base font-bold text-slate-900">${p.salesPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Cost Price</span>
                    <span className="font-[family-name:var(--font-serif)] text-sm font-semibold text-slate-600">${p.costPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Variants List (Scene 2 requirement) */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#c9ab70]" />
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
                      {p.variants.map((v) => {
                        const isOdoo = v.name.toLowerCase().includes('odoo');
                        return (
                          <div
                            key={v.id}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                              isOdoo
                                ? 'bg-[#c9ab70]/10 border border-[#c9ab70]/40 text-slate-900 font-semibold'
                                : 'bg-slate-50 border border-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="font-medium truncate flex items-center gap-1.5">
                              {v.name}
                              {isOdoo && (
                                <span className="rounded bg-[#1c2530] text-[#c9ab70] border border-[#c9ab70]/40 px-1 py-0.2 text-[9px] font-bold">
                                  Scene 2
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-[#1c2530] shrink-0">
                              {v.priceDelta > 0 ? `+$${v.priceDelta.toFixed(2)}` : 'Standard'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {p.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 italic">Note: {p.notes}</p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#c9ab70] px-2 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove "${p.name}" from catalog?`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create Product with Variants */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-xl my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Scene 2: Admin Product Setup
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">Launch New Product</h3>
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal ops notes..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                    className="inline-flex items-center gap-1 rounded-lg bg-[#1c2530] px-2.5 py-1 text-xs font-semibold text-[#c9ab70] hover:bg-[#212c37] cursor-pointer transition-colors"
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
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#c9ab70] focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Attribute (e.g. Brand)"
                        value={v.attribute}
                        onChange={(e) => handleUpdateVariant(idx, 'attribute', e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#c9ab70] focus:outline-hidden"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#c9ab70] focus:outline-hidden"
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
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit Existing Product */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-xl my-8">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="rounded-full bg-[#1c2530] border border-[#c9ab70]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#c9ab70]">
                Admin Product Management
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-900">
                Edit Product: {editingProduct.name}
              </h3>
              <p className="text-xs text-slate-500">
                Update sales price, costs, descriptions, or variant price differentials.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classification
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ProductType)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  >
                    <option value="software">Software Platform</option>
                    <option value="addon">Add-on Module</option>
                    <option value="service">Services & SLA</option>
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
                    value={editSalesPrice}
                    onChange={(e) => setEditSalesPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
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
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#c9ab70] focus:ring-1 focus:ring-[#c9ab70] focus:outline-hidden"
                />
              </div>

              {/* Variants Section */}
              <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#c9ab70]" />
                    <span>Variants & Pricing Deltas</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditVariants((prev) => [
                        ...prev,
                        {
                          id: `var-${Date.now()}-${prev.length}`,
                          name: 'New Brand Variant',
                          attribute: 'Brand',
                          priceDelta: 0,
                        },
                      ])
                    }
                    className="text-[11px] font-semibold text-[#c9ab70] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editVariants.map((v, idx) => (
                    <div key={v.id || idx} className="flex items-center gap-2 bg-white p-2 rounded-md border border-slate-100 text-xs">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="Variant Name"
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={v.attribute}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, attribute: val } : item))
                          );
                        }}
                        placeholder="Attribute"
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">+$</span>
                        <input
                          type="number"
                          value={v.priceDelta}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, priceDelta: val } : item))
                            );
                          }}
                          className="w-20 rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditVariants((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-light-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

