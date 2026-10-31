<template>
  <ProductMenuView />
  <div class="product-page container-fluid py-4 px-3 px-lg-4">
    <!-- Page heading -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-light border back-btn" type="button" aria-label="Go back">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 class="h3 fw-bold mb-1">Add New Product</h1>
          <p class="text-secondary mb-0">পণ্যের বিস্তারিত তথ্য ইনভেন্টরিতে যোগ করুন</p>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" type="button" @click="resetForm">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
        </button>
        <button class="btn btn-primary px-4" type="button" @click="saveDemo">
          <i class="bi bi-check2-circle me-1"></i> Save Product
        </button>
      </div>
    </div>

    <div v-if="notice" class="alert alert-info alert-dismissible fade show" role="alert">
      <i class="bi bi-info-circle me-2"></i>{{ notice }}
      <button type="button" class="btn-close" aria-label="Close" @click="notice = ''"></button>
    </div>

    <div class="row g-4">
      <!-- Main form -->
      <div class="col-12 col-xxl-8">
        <div class="card border-0 shadow-sm form-card">
          <div class="card-body p-3 p-md-4">
            <!-- Product type selector -->
            <div class="category-strip mb-4">
              <label class="form-label fw-semibold"
                >Product Category <span class="text-danger">*</span></label
              >
              <div class="row g-2">
                <div class="col-12 col-md-4" v-for="option in productTypes" :key="option.value">
                  <button
                    type="button"
                    class="category-option w-100"
                    :class="{ active: form.productType === option.value }"
                    @click="changeProductType(option.value)"
                  >
                    <span class="category-icon">
                      <i :class="option.icon"></i>
                    </span>
                    <span class="text-start">
                      <span class="d-block fw-semibold">{{ option.label }}</span>
                      <small class="text-secondary">{{ option.subtitle }}</small>
                    </span>
                    <i
                      v-if="form.productType === option.value"
                      class="bi bi-check-circle-fill ms-auto active-check"
                    ></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <ul class="nav nav-pills product-tabs mb-4" role="tablist">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'basic' }"
                  @click="activeTab = 'basic'"
                  type="button"
                >
                  <i class="bi bi-card-text me-1"></i> Basic Information
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'stock' }"
                  @click="activeTab = 'stock'"
                  type="button"
                >
                  <i class="bi bi-box-seam me-1"></i> Variant / Stock
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'pricing' }"
                  @click="activeTab = 'pricing'"
                  type="button"
                >
                  <i class="bi bi-cash-coin me-1"></i> Purchase & Pricing
                </button>
              </li>
            </ul>

            <!-- Basic information -->
            <section v-show="activeTab === 'basic'">
              <div class="section-heading mb-3">
                <h2 class="h6 fw-bold mb-1">Basic Information</h2>
                <p class="small text-secondary mb-0">পণ্যের পরিচিতি ও শনাক্তকরণ তথ্য</p>
              </div>

              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Item Name <span class="text-danger">*</span></label>
                  <input
                    v-model.trim="form.name"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !form.name }"
                    placeholder="যেমন: Premium Cotton Three Piece"
                  />
                  <div class="invalid-feedback">পণ্যের নাম লিখুন।</div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Brand Name</label>
                  <div class="input-group">
                    <select v-model="form.brand" class="form-select">
                      <option value="">ব্র্যান্ড নির্বাচন করুন</option>
                      <option v-for="brand in brandOptions" :key="brand" :value="brand">
                        {{ brand }}
                      </option>
                      <option value="Other">Other / নিজস্ব ব্র্যান্ড</option>
                    </select>
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      title="Demo: add brand"
                      @click="addBrandDemo"
                    >
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Product Type</label>
                  <select v-model="form.subType" class="form-select">
                    <option v-for="item in subTypeOptions" :key="item" :value="item">
                      {{ item }}
                    </option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Category <span class="text-danger">*</span></label>
                  <select v-model="form.category" class="form-select">
                    <option v-for="item in categoryOptions" :key="item" :value="item">
                      {{ item }}
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Product Code / SKU</label>
                  <div class="input-group">
                    <input
                      v-model.trim="form.sku"
                      class="form-control"
                      placeholder="যেমন: CL-001"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="generateSku"
                      title="Generate product code"
                    >
                      <i class="bi bi-magic"></i>
                    </button>
                  </div>
                  <div class="form-text">পণ্য শনাক্ত করার জন্য ইউনিক কোড</div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Barcode</label>
                  <div class="input-group">
                    <input
                      v-model.trim="form.barcode"
                      class="form-control"
                      placeholder="বারকোড লিখুন বা স্ক্যান করুন"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="generateBarcode"
                      title="Generate demo barcode"
                    >
                      <i class="bi bi-upc-scan"></i>
                    </button>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Description / Note</label>
                  <textarea
                    v-model.trim="form.description"
                    class="form-control"
                    rows="3"
                    maxlength="500"
                    placeholder="পণ্যের বিবরণ, গুণগত মান বা অতিরিক্ত নোট..."
                  ></textarea>
                  <div class="form-text text-end">{{ form.description.length }}/500</div>
                </div>

                <!-- Clothing fields -->
                <template v-if="form.productType === 'clothing'">
                  <div class="col-12">
                    <hr class="my-1" />
                    <h3 class="h6 fw-bold mb-0">পোশাকের বিস্তারিত</h3>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Design / Pattern</label>
                    <input
                      v-model.trim="form.design"
                      class="form-control"
                      placeholder="যেমন: Floral Print / D-101"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Gender / Collection</label>
                    <select v-model="form.gender" class="form-select">
                      <option value="">নির্বাচন করুন</option>
                      <option>Men</option>
                      <option>Women</option>
                      <option>Kids</option>
                      <option>Unisex</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Season (ঐচ্ছিক)</label>
                    <select v-model="form.season" class="form-select">
                      <option value="">নির্বাচন করুন</option>
                      <option>Summer</option>
                      <option>Winter</option>
                      <option>All Season</option>
                      <option>Festive</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Material / Fabric</label>
                    <input
                      v-model.trim="form.material"
                      class="form-control"
                      placeholder="যেমন: Cotton, Silk, Linen"
                    />
                  </div>
                </template>

                <!-- Cosmetics fields -->
                <template v-if="form.productType === 'cosmetics'">
                  <div class="col-12">
                    <hr class="my-1" />
                    <h3 class="h6 fw-bold mb-0">কসমেটিকসের বিস্তারিত</h3>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Size / Volume</label>
                    <input
                      v-model.trim="form.volume"
                      class="form-control"
                      placeholder="যেমন: 100 ml, 200 g"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Shade / Color</label>
                    <input
                      v-model.trim="form.color"
                      class="form-control"
                      placeholder="যেখানে প্রযোজ্য"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Batch Number</label>
                    <input
                      v-model.trim="form.batchNumber"
                      class="form-control"
                      placeholder="ব্যাচ নম্বর"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Expiry Date</label>
                    <input v-model="form.expiryDate" type="date" class="form-control" />
                  </div>
                </template>

                <!-- Fabric fields -->
                <template v-if="form.productType === 'fabric'">
                  <div class="col-12">
                    <hr class="my-1" />
                    <h3 class="h6 fw-bold mb-0">গজ কাপড়ের বিস্তারিত</h3>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Fabric Type <span class="text-danger">*</span></label>
                    <select v-model="form.fabricType" class="form-select">
                      <option value="">কাপড়ের ধরন নির্বাচন করুন</option>
                      <option>Cotton</option>
                      <option>Silk</option>
                      <option>Georgette</option>
                      <option>Linen</option>
                      <option>Polyester</option>
                      <option>Denim</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Design / Print</label>
                    <input
                      v-model.trim="form.design"
                      class="form-control"
                      placeholder="যেমন: Plain, Floral, Striped"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Color</label>
                    <input
                      v-model.trim="form.color"
                      class="form-control"
                      placeholder="যেমন: Navy Blue"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Width (ঐচ্ছিক)</label>
                    <input
                      v-model.trim="form.width"
                      class="form-control"
                      placeholder="যেমন: 44 inch"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Weight / GSM (ঐচ্ছিক)</label>
                    <input
                      v-model.trim="form.gsm"
                      class="form-control"
                      placeholder="যেমন: 180 GSM"
                    />
                  </div>
                </template>
              </div>
            </section>

            <!-- Stock / variants -->
            <section v-show="activeTab === 'stock'">
              <div class="section-heading mb-3">
                <h2 class="h6 fw-bold mb-1">
                  {{ form.productType === 'fabric' ? 'Fabric Stock' : 'Variant & Stock' }}
                </h2>
                <p class="small text-secondary mb-0">
                  {{
                    form.productType === 'fabric'
                      ? 'গজ বা মিটার অনুযায়ী কাপড়ের স্টক লিখুন। দশমিক পরিমাণ দেওয়া যাবে।'
                      : 'সাইজ ও রং অনুযায়ী আলাদা স্টক রাখতে চাইলে Variant যোগ করুন।'
                  }}
                </p>
              </div>

              <template v-if="form.productType === 'fabric'">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Stock Unit <span class="text-danger">*</span></label>
                    <select v-model="form.unit" class="form-select">
                      <option value="গজ">গজ (Yard)</option>
                      <option value="মিটার">মিটার (Meter)</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label"
                      >Available Length ({{ form.unit }}) <span class="text-danger">*</span></label
                    >
                    <input
                      v-model.number="form.stock"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      :class="{ 'is-invalid': submitted && form.stock < 0 }"
                      placeholder="যেমন: 100.5"
                    />
                    <div class="form-text">উদাহরণ: ১০০ গজ − ২.৫ গজ বিক্রি = ৯৭.৫ গজ অবশিষ্ট।</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Reorder Level ({{ form.unit }})</label>
                    <input
                      v-model.number="form.reorderLevel"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      placeholder="কম স্টকের সতর্কতা"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Storage / Rack (ঐচ্ছিক)</label>
                    <input
                      v-model.trim="form.rack"
                      class="form-control"
                      placeholder="যেমন: Rack A-2"
                    />
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div>
                    <div class="fw-semibold">Product Variants</div>
                    <div class="small text-secondary">
                      একই পণ্যের সাইজ/রংভেদে আলাদা স্টক (ঐচ্ছিক)
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" type="button" @click="addVariant">
                    <i class="bi bi-plus-lg me-1"></i> Add Variant
                  </button>
                </div>
                <div class="table-responsive border rounded-3">
                  <table class="table align-middle mb-0 variant-table">
                    <thead>
                      <tr>
                        <th v-if="form.productType === 'clothing'">Size</th>
                        <th>Color / Shade</th>
                        <th>SKU / Code</th>
                        <th class="text-end">Opening Stock</th>
                        <th>Unit</th>
                        <th class="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(variant, index) in variants" :key="variant.id">
                        <td v-if="form.productType === 'clothing'">
                          <select v-model="variant.size" class="form-select form-select-sm">
                            <option value="">—</option>
                            <option v-for="size in sizeOptions" :key="size" :value="size">
                              {{ size }}
                            </option>
                          </select>
                        </td>
                        <td>
                          <input
                            v-model.trim="variant.color"
                            class="form-control form-control-sm"
                            placeholder="রং"
                          />
                        </td>
                        <td>
                          <input
                            v-model.trim="variant.sku"
                            class="form-control form-control-sm"
                            placeholder="Optional"
                          />
                        </td>
                        <td>
                          <input
                            v-model.number="variant.stock"
                            type="number"
                            min="0"
                            step="1"
                            class="form-control form-control-sm text-end"
                          />
                        </td>
                        <td>
                          <select v-model="variant.unit" class="form-select form-select-sm">
                            <option>পিস</option>
                            <option>সেট</option>
                            <option>ডজন</option>
                            <option>বক্স</option>
                          </select>
                        </td>
                        <td class="text-center">
                          <button
                            class="btn btn-sm btn-light text-danger"
                            type="button"
                            @click="removeVariant(index)"
                            :disabled="variants.length === 1"
                            aria-label="Remove variant"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="d-flex flex-wrap justify-content-between gap-2 mt-3">
                  <span class="small text-secondary"
                    ><i class="bi bi-info-circle me-1"></i>Variant ব্যবহার না করলে সাধারণ স্টক
                    পরিমাণ দিন।</span
                  >
                  <span class="fw-semibold">Variant Stock Total: {{ variantStockTotal }}</span>
                </div>
                <div class="row g-3 mt-2">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Opening Stock (সাধারণ স্টক) *</label>
                    <input
                      v-model.number="form.stock"
                      type="number"
                      min="0"
                      step="1"
                      class="form-control"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Unit</label>
                    <select v-model="form.unit" class="form-select">
                      <option>পিস</option>
                      <option>সেট</option>
                      <option>ডজন</option>
                      <option>বক্স</option>
                      <option>প্যাকেট</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Low Stock Alert At</label>
                    <input
                      v-model.number="form.reorderLevel"
                      type="number"
                      min="0"
                      step="1"
                      class="form-control"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Storage / Rack (ঐচ্ছিক)</label>
                    <input
                      v-model.trim="form.rack"
                      class="form-control"
                      placeholder="যেমন: Rack A-2"
                    />
                  </div>
                </div>
              </template>
            </section>

            <!-- Pricing -->
            <section v-show="activeTab === 'pricing'">
              <div class="section-heading mb-3">
                <h2 class="h6 fw-bold mb-1">Purchase & Pricing</h2>
                <p class="small text-secondary mb-0">
                  ক্রয়মূল্য ও বিক্রয়মূল্য লিখুন। লাভের হিসাব আনুমানিক।
                </p>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label"
                    >Purchase Price (প্রতি {{ form.unit }}) ৳
                    <span class="text-danger">*</span></label
                  >
                  <div class="input-group">
                    <span class="input-group-text">৳</span>
                    <input
                      v-model.number="form.purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      :class="{ 'is-invalid': submitted && form.purchasePrice < 0 }"
                      placeholder="500.00"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label"
                    >Selling Price (প্রতি {{ form.unit }}) ৳
                    <span class="text-danger">*</span></label
                  >
                  <div class="input-group">
                    <span class="input-group-text">৳</span>
                    <input
                      v-model.number="form.salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      :class="{ 'is-invalid': submitted && form.salePrice < 0 }"
                      placeholder="650.00"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Wholesale Price (ঐচ্ছিক) ৳</label>
                  <div class="input-group">
                    <span class="input-group-text">৳</span>
                    <input
                      v-model.number="form.wholesalePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      placeholder="পাইকারি মূল্য"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Discount (ঐচ্ছিক) %</label>
                  <div class="input-group">
                    <input
                      v-model.number="form.discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      class="form-control"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                </div>
                <div class="col-12">
                  <div class="profit-panel p-3 p-md-4">
                    <div class="row g-3 align-items-center">
                      <div class="col-12 col-md-4">
                        <div class="small text-secondary mb-1">Profit per {{ form.unit }}</div>
                        <div
                          class="h3 fw-bold mb-0"
                          :class="unitProfit >= 0 ? 'text-success' : 'text-danger'"
                        >
                          {{ money(unitProfit) }}
                        </div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div class="small text-secondary mb-1">Profit Margin</div>
                        <div class="h5 fw-semibold mb-0">{{ profitMargin.toFixed(1) }}%</div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div class="small text-secondary mb-1">Total Stock Cost</div>
                        <div class="h5 fw-semibold mb-0">
                          {{ money((Number(form.purchasePrice) || 0) * (Number(form.stock) || 0)) }}
                        </div>
                      </div>
                    </div>
                    <div class="small text-secondary mt-3">
                      এটি শুধু প্রাথমিক হিসাব। ডিসকাউন্ট, রিটার্ন, অন্যান্য খরচ ও পৃথক Purchase
                      Batch হিসাব চূড়ান্ত লাভে প্রভাব ফেলবে।
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input
                      id="activeProduct"
                      v-model="form.isActive"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                    />
                    <label class="form-check-label fw-medium" for="activeProduct"
                      >Product Active</label
                    >
                    <div class="form-text">
                      বন্ধ করলে ভবিষ্যতে বিক্রির তালিকায় পণ্যটি লুকানো যেতে পারে।
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="card-footer bg-white border-0 px-3 px-md-4 pb-4">
            <div class="d-flex justify-content-between align-items-center gap-2">
              <button
                class="btn btn-light border"
                type="button"
                @click="previousTab"
                :disabled="activeTab === 'basic'"
              >
                <i class="bi bi-arrow-left me-1"></i> Previous
              </button>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" type="button" @click="resetForm">
                  Cancel / Reset
                </button>
                <button
                  v-if="activeTab !== 'pricing'"
                  class="btn btn-primary px-4"
                  type="button"
                  @click="nextTab"
                >
                  Continue <i class="bi bi-arrow-right ms-1"></i>
                </button>
                <button v-else class="btn btn-success px-4" type="button" @click="saveDemo">
                  <i class="bi bi-check2-circle me-1"></i> Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary sidebar -->
      <div class="col-12 col-xxl-4">
        <div class="summary-sticky">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 pt-4 px-4">
              <h2 class="h6 fw-bold mb-0">Product Image</h2>
              <p class="small text-secondary mt-1 mb-0">ঐচ্ছিক: পণ্যের ছবি আপলোড করুন</p>
            </div>
            <div class="card-body px-4 pb-4">
              <div
                class="image-upload-area"
                :class="{ 'has-image': imagePreview }"
                @click="triggerFilePicker"
                @dragover.prevent
                @drop.prevent="onImageDrop"
                role="button"
                tabindex="0"
                @keydown.enter="triggerFilePicker"
              >
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Product preview"
                  class="product-image-preview"
                />
                <div v-else class="upload-placeholder">
                  <i class="bi bi-cloud-arrow-up display-5 text-primary"></i>
                  <div class="fw-semibold mt-2">Click to upload</div>
                  <small class="text-secondary">অথবা ছবি এখানে টেনে আনুন</small>
                  <small class="text-secondary d-block mt-1">PNG, JPG (Demo UI)</small>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onImageChange"
              />
              <button
                v-if="imagePreview"
                class="btn btn-sm btn-outline-danger mt-2"
                type="button"
                @click="removeImage"
              >
                <i class="bi bi-trash me-1"></i> Remove Image
              </button>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 pt-4 px-4">
              <h2 class="h6 fw-bold mb-0">Product Summary</h2>
            </div>
            <div class="card-body px-4">
              <div class="summary-row">
                <span>Item Name</span><strong>{{ form.name || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span>Product Type</span><strong>{{ currentTypeLabel }}</strong>
              </div>
              <div class="summary-row">
                <span>Brand</span><strong>{{ form.brand || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span>Category</span><strong>{{ form.category || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span>SKU</span><strong>{{ form.sku || 'Auto / —' }}</strong>
              </div>
              <div class="summary-row">
                <span>Barcode</span><strong>{{ form.barcode || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span>Stock</span><strong>{{ form.stock || 0 }} {{ form.unit }}</strong>
              </div>
              <div class="summary-row">
                <span>Purchase Price</span><strong>{{ money(form.purchasePrice) }}</strong>
              </div>
              <div class="summary-row">
                <span>Selling Price</span><strong>{{ money(form.salePrice) }}</strong>
              </div>
              <div class="summary-row">
                <span>Status</span
                ><span
                  class="badge"
                  :class="form.isActive ? 'text-bg-success' : 'text-bg-secondary'"
                  >{{ form.isActive ? 'Active' : 'Inactive' }}</span
                >
              </div>
              <hr />
              <div class="d-flex align-items-center justify-content-between gap-3">
                <div>
                  <div class="small text-secondary">Estimated profit / unit</div>
                  <div
                    class="h4 fw-bold mb-0"
                    :class="unitProfit >= 0 ? 'text-success' : 'text-danger'"
                  >
                    {{ money(unitProfit) }}
                  </div>
                </div>
                <span class="summary-profit-icon"><i class="bi bi-graph-up-arrow"></i></span>
              </div>
            </div>
            <div class="card-footer bg-light border-0 p-3 rounded-bottom-4">
              <div class="small text-secondary">
                <i class="bi bi-shield-check me-1"></i> Frontend demo only — কোনো তথ্য সার্ভারে
                পাঠানো হচ্ছে না।
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import ProductMenuView from './productMenu.vue'

const productTypes = [
  { value: 'clothing', label: 'Clothing', subtitle: 'পোশাক ও ফ্যাশন', icon: 'bi bi-handbag' },
  {
    value: 'cosmetics',
    label: 'Cosmetics',
    subtitle: 'প্রসাধনী ও স্কিন কেয়ার',
    icon: 'bi bi-droplet-half',
  },
  {
    value: 'fabric',
    label: 'Gaj Kapor / Fabric',
    subtitle: 'গজ বা মিটার কাপড়',
    icon: 'bi bi-rulers',
  },
]

const defaultForm = () => ({
  productType: 'clothing',
  name: '',
  brand: '',
  subType: 'Three Piece',
  category: 'পোশাক',
  sku: '',
  barcode: '',
  description: '',
  design: '',
  gender: '',
  season: '',
  material: '',
  color: '',
  volume: '',
  batchNumber: '',
  expiryDate: '',
  fabricType: '',
  width: '',
  gsm: '',
  unit: 'পিস',
  stock: 10,
  reorderLevel: 3,
  rack: '',
  purchasePrice: 500,
  salePrice: 650,
  wholesalePrice: 0,
  discount: 0,
  isActive: true,
})

const form = reactive(defaultForm())
const activeTab = ref('basic')
const submitted = ref(false)
const notice = ref('')
const imagePreview = ref('')
const fileInput = ref(null)
const brandOptions = ref(['Aarong', 'Yellow', 'Cats Eye', 'Richman', 'Sailor', 'Local Brand'])
const variants = ref([
  { id: 1, size: 'M', color: 'Black', sku: '', stock: 3, unit: 'পিস' },
  { id: 2, size: 'L', color: 'Black', sku: '', stock: 4, unit: 'পিস' },
  { id: 3, size: 'M', color: 'Blue', sku: '', stock: 3, unit: 'পিস' },
])
let nextVariantId = 4

const subTypeMap = {
  clothing: [
    'Saree',
    'Lungi',
    'Three Piece',
    'Two Piece',
    'One Piece',
    'Panjabi',
    'Shirt',
    'T-Shirt',
    'Other',
  ],
  cosmetics: [
    'Face Wash',
    'Cream / Lotion',
    'Shampoo',
    'Soap',
    'Makeup',
    'Perfume',
    'Hair Care',
    'Other',
  ],
  fabric: ['Cotton Fabric', 'Silk Fabric', 'Printed Fabric', 'Linen Fabric', 'Other'],
}
const categoryMap = {
  clothing: ['পোশাক', 'শাড়ি', 'লুঙ্গি', 'থ্রি-পিস', 'টু-পিস', 'ওয়ান-পিস', 'পাঞ্জাবি', 'অন্যান্য'],
  cosmetics: ['কসমেটিকস', 'স্কিন কেয়ার', 'হেয়ার কেয়ার', 'মেকআপ', 'পারফিউম', 'অন্যান্য'],
  fabric: ['গজ কাপড়', 'সুতি কাপড়', 'সিল্ক কাপড়', 'প্রিন্ট কাপড়', 'অন্যান্য'],
}
const sizeOptions = [
  'Free Size',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
]

const subTypeOptions = computed(() => subTypeMap[form.productType])
const categoryOptions = computed(() => categoryMap[form.productType])
const currentTypeLabel = computed(
  () => productTypes.find((item) => item.value === form.productType)?.label || 'Clothing',
)
const unitProfit = computed(() => (Number(form.salePrice) || 0) - (Number(form.purchasePrice) || 0))
const profitMargin = computed(() => {
  const sale = Number(form.salePrice) || 0
  return sale > 0 ? (unitProfit.value / sale) * 100 : 0
})
const variantStockTotal = computed(() =>
  variants.value.reduce((total, item) => total + (Number(item.stock) || 0), 0),
)

function changeProductType(type) {
  form.productType = type
  form.category = categoryMap[type][0]
  form.subType = subTypeMap[type][0]
  form.unit = type === 'fabric' ? 'গজ' : 'পিস'
  if (type === 'fabric') {
    form.stock = 100
  } else if (type === 'clothing') {
    form.stock = 10
  } else {
    form.stock = 10
  }
  activeTab.value = 'basic'
  notice.value = ''
}

function addVariant() {
  variants.value.push({
    id: nextVariantId++,
    size: '',
    color: '',
    sku: '',
    stock: 0,
    unit: form.unit || 'পিস',
  })
}

function removeVariant(index) {
  if (variants.value.length > 1) variants.value.splice(index, 1)
}

function generateSku() {
  const prefix =
    form.productType === 'fabric' ? 'FAB' : form.productType === 'cosmetics' ? 'COS' : 'CL'
  form.sku = `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function generateBarcode() {
  form.barcode = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
}

function money(value) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function nextTab() {
  if (activeTab.value === 'basic') activeTab.value = 'stock'
  else if (activeTab.value === 'stock') activeTab.value = 'pricing'
}

function previousTab() {
  if (activeTab.value === 'pricing') activeTab.value = 'stock'
  else if (activeTab.value === 'stock') activeTab.value = 'basic'
}

function saveDemo() {
  submitted.value = true
  if (!form.name.trim()) {
    activeTab.value = 'basic'
    notice.value = 'অনুগ্রহ করে পণ্যের নাম লিখুন। এটি Demo UI—এখনো কোনো তথ্য সংরক্ষণ হচ্ছে না।'
    return
  }
  if (form.productType === 'fabric' && !form.fabricType) {
    activeTab.value = 'basic'
    notice.value = 'গজ কাপড়ের জন্য Fabric Type নির্বাচন করুন। এটি Demo UI—তথ্য সংরক্ষণ হচ্ছে না।'
    return
  }
  notice.value = `Demo preview: "${form.name}" ফর্মটি যাচাই করা হয়েছে। Backend সংযুক্ত না থাকায় পণ্যটি সংরক্ষণ করা হয়নি।`
}

function resetForm() {
  Object.assign(form, defaultForm())
  variants.value = [
    { id: 1, size: 'M', color: 'Black', sku: '', stock: 3, unit: 'পিস' },
    { id: 2, size: 'L', color: 'Black', sku: '', stock: 4, unit: 'পিস' },
    { id: 3, size: 'M', color: 'Blue', sku: '', stock: 3, unit: 'পিস' },
  ]
  nextVariantId = 4
  activeTab.value = 'basic'
  submitted.value = false
  notice.value = ''
  removeImage()
}

function addBrandDemo() {
  notice.value = 'Demo: ব্র্যান্ড যোগ করার জন্য পরে আলাদা Add Brand modal/API সংযুক্ত করা যাবে।'
}

function triggerFilePicker() {
  fileInput.value?.click()
}

function onImageChange(event) {
  const file = event.target.files?.[0]
  if (file) readImage(file)
}

function onImageDrop(event) {
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) readImage(file)
}

function readImage(file) {
  if (!file.type.startsWith('image/')) {
    notice.value = 'অনুগ্রহ করে একটি image file নির্বাচন করুন।'
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    imagePreview.value = event.target?.result || ''
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.product-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
}
.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}
.form-card,
.summary-sticky .card {
  border-radius: 16px;
}
.category-strip {
  padding: 16px;
  background: #f8faff;
  border: 1px solid #e6ebf5;
  border-radius: 14px;
}
.category-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px;
  color: #334155;
  text-align: left;
  background: #fff;
  border: 1px solid #dfe5ef;
  border-radius: 12px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}
.category-option:hover {
  border-color: #9bbcff;
}
.category-option.active {
  background: #eef4ff;
  border-color: #377dff;
  box-shadow: 0 0 0 2px rgba(55, 125, 255, 0.08);
}
.category-icon {
  display: grid;
  place-items: center;
  flex: 0 0 42px;
  height: 42px;
  color: #2563eb;
  background: #e7efff;
  border-radius: 12px;
  font-size: 1.2rem;
}
.active-check {
  color: #2563eb;
}
.product-tabs {
  gap: 6px;
  border-bottom: 1px solid #e9edf4;
  border-radius: 0;
  padding-bottom: 12px;
}
.product-tabs .nav-link {
  color: #64748b;
  border-radius: 9px;
  font-size: 0.9rem;
  padding: 10px 13px;
  white-space: nowrap;
}
.product-tabs .nav-link.active {
  color: #fff;
  background: #2563eb;
}
.form-label {
  color: #344054;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 7px;
}
.form-control,
.form-select,
.input-group-text,
.input-group .btn {
  min-height: 43px;
  border-color: #dce2eb;
  border-radius: 9px;
}
.form-control,
.form-select {
  font-size: 0.92rem;
}
.form-control:focus,
.form-select:focus {
  border-color: #80aaff;
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.1);
}
.input-group > .form-control,
.input-group > .form-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.input-group > .btn,
.input-group > .input-group-text {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.section-heading {
  padding-bottom: 13px;
  border-bottom: 1px solid #edf0f5;
}
.variant-table thead th {
  color: #64748b;
  background: #f8fafc;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  border-bottom-color: #e7ebf2;
}
.variant-table td {
  min-width: 105px;
  padding: 10px;
}
.variant-table td:first-child,
.variant-table th:first-child {
  padding-left: 14px;
}
.variant-table .form-control,
.variant-table .form-select {
  min-width: 85px;
  min-height: 36px;
  font-size: 0.82rem;
}
.profit-panel {
  background: linear-gradient(135deg, #f0fdf4, #f8fafc);
  border: 1px solid #d9f1e1;
  border-radius: 14px;
}
.image-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 230px;
  overflow: hidden;
  padding: 16px;
  text-align: center;
  background: #f8fbff;
  border: 1.5px dashed #b9c9e2;
  border-radius: 14px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}
.image-upload-area:hover {
  background: #f0f6ff;
  border-color: #377dff;
}
.image-upload-area.has-image {
  border-style: solid;
  background: #fff;
}
.product-image-preview {
  display: block;
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 8px;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.summary-row {
  display: grid;
  grid-template-columns: minmax(95px, 0.8fr) minmax(0, 1.2fr);
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #edf0f5;
  font-size: 0.85rem;
}
.summary-row:last-of-type {
  border-bottom: 0;
}
.summary-row > span:first-child {
  color: #64748b;
}
.summary-row strong {
  overflow-wrap: anywhere;
  text-align: right;
  font-weight: 600;
  color: #273449;
}
.summary-profit-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  color: #15803d;
  background: #dcfce7;
  border-radius: 13px;
  font-size: 1.3rem;
}
@media (min-width: 1400px) {
  .summary-sticky {
    position: sticky;
    top: 20px;
  }
}
@media (max-width: 767.98px) {
  .product-page {
    padding-top: 18px !important;
  }
  .product-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .product-tabs .nav-link {
    font-size: 0.8rem;
    padding: 9px 10px;
  }
  .category-strip {
    padding: 12px;
  }
}
.product-page {
  width: 86%;
  margin-left: 262px;
}
</style>
