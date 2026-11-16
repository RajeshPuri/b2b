'use strict';

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

const accounts = [
  {
    email: 'admin@b2b.com',
    password: 'admin123',
    name: 'Admin User',
  },
  {
    email: 'wholesaler@b2b.com',
    password: 'wholesale123',
    name: 'Maya Sharma',
  },
  {
    email: 'client@b2b.com',
    password: 'client123',
    name: 'Jordan Lee',
  },
];

const wholesaler = {
  userId: '11111111-1111-4111-8111-111111111111',
  businessId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  membershipId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
  profileId: 'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
  businessName: 'Atelier North Studio',
  tenantId: 'tenant_wholesaler',
};

const client = {
  userId: '22222222-2222-4222-8222-222222222222',
  businessId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  membershipId: 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb',
  profileId: 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
  businessName: 'Urban Threads Retail',
};

async function upsertAccount(account) {
  const hash = bcrypt.hashSync(account.password, 10);
  const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [account.email]);

  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE "User" SET "passwordHash" = $1, name = $2, status = $3, "updatedAt" = NOW() WHERE email = $4',
      [hash, account.name, 'active', account.email]
    );
    return existing.rows[0].id;
  }

  const inserted = await pool.query(
    'INSERT INTO "User" (id, email, "passwordHash", name, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
    [account.userId || require('crypto').randomUUID(), account.email, hash, account.name, 'active']
  );
  return inserted.rows[0].id;
}

async function upsertBusiness(business) {
  await pool.query(
    `INSERT INTO "Business" (id, name, "type", "verificationStatus", currency, country, status, createdat, updatedat)
     VALUES ($1, $2, $3, 'VERIFIED', 'USD', 'US', 'active', NOW(), NOW())
     ON CONFLICT (name) DO UPDATE SET "verificationStatus" = 'VERIFIED', status = 'active', updatedat = NOW()`,
    [business.businessId, business.businessName, business.businessType]
  );
}

async function upsertMembership(membership) {
  await pool.query(
    'DELETE FROM "BusinessMembership" WHERE "userId" = $1 AND "businessId" = $2',
    [membership.userId, membership.businessId]
  );
  await pool.query(
    `INSERT INTO "BusinessMembership" (id, "userId", "businessId", role, status, "invitedAt", "joinedAt")
     VALUES ($1, $2, $3, 'OWNER', 'ACTIVE', NOW(), NOW())`,
    [membership.membershipId, membership.userId, membership.businessId]
  );
}

async function seedWholesaler() {
  await upsertBusiness({ businessId: wholesaler.businessId, businessName: wholesaler.businessName, businessType: 'WHOLESALER' });
  await upsertMembership({ membershipId: wholesaler.membershipId, userId: wholesaler.userId, businessId: wholesaler.businessId });

  await pool.query('DELETE FROM "WholesalerProfile" WHERE "businessId" = $1', [wholesaler.businessId]);
  await pool.query(
    `INSERT INTO "WholesalerProfile"
       (id, "businessId", cinnumber, pannumber, bankaccountname, bankaccountnumber, bankname, bankbranch, ifsccode, approvedlimit, createdat, updatedat)
     VALUES ($1, $2, 'CIN-U12345-2020', 'PAN-4821-AK', 'Atelier North Studio', '0012345678901', 'Himalayan Bank', 'Durbar Marg', 'HIMANPKA', 250000, NOW(), NOW())`,
    [wholesaler.profileId, wholesaler.businessId]
  );

  await pool.query(
    `INSERT INTO "Tenant" (id, name, ownerid, plan, status, createdat, updatedat)
     VALUES ($1, $2, $3, 'pro', 'active', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET name = $2, ownerid = $3, plan = 'pro', status = 'active', updatedat = NOW()`,
    [wholesaler.tenantId, wholesaler.businessName, wholesaler.userId]
  );

  const categories = await pool.query('SELECT id, slug FROM "Category"');
  const bySlug = Object.fromEntries(categories.rows.map((c) => [c.slug, c.id]));

  const products = [
    {
      id: 'c1111111-1111-4111-8111-111111111111',
      name: 'Heavyweight Boxy Tee',
      slug: 'heavyweight-boxy-tee',
      sku: 'ATN-TEE-001',
      description: '240 GSM combed cotton tee with a boxy retail fit. Pre-shrunk and garment dyed.',
      brand: 'Atelier North',
      fabricmaterial: '100% combed cotton, 240 GSM',
      categoryId: bySlug["mens-clothing"],
    },
    {
      id: 'c2222222-2222-4222-8222-222222222222',
      name: 'Relaxed Linen Shirt',
      slug: 'relaxed-linen-shirt',
      sku: 'ATN-SHT-002',
      description: 'Garment-washed European linen shirt with a relaxed collar and mother-of-pearl buttons.',
      brand: 'Atelier North',
      fabricmaterial: '100% European linen',
      categoryId: bySlug["mens-clothing"],
    },
    {
      id: 'c3333333-3333-4333-8333-333333333333',
      name: 'Utility Cargo Pant',
      slug: 'utility-cargo-pant',
      sku: 'ATN-PNT-003',
      description: 'Six-pocket cotton twill cargo with reinforced knees and a tapered leg.',
      brand: 'Atelier North',
      fabricmaterial: '98% cotton twill, 2% elastane',
      categoryId: bySlug["mens-clothing"],
    },
    {
      id: 'c4444444-4444-4444-8444-444444444444',
      name: 'Cropped Puffer Jacket',
      slug: 'cropped-puffer-jacket',
      sku: 'ATN-JKT-004',
      description: 'Recycled shell cropped puffer with thermal fill and a matte finish.',
      brand: 'Atelier North',
      fabricmaterial: 'Recycled polyester shell, thermal fill',
      categoryId: bySlug["womens-clothing"],
    },
  ];

  for (const product of products) {
    await pool.query(
      `INSERT INTO "Product"
         (id, "businessId", "categoryId", name, slug, sku, description, brand, fabricmaterial, productstatus, createdat, updatedat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $4, sku = $6, brand = $8, fabricmaterial = $9, productstatus = 'ACTIVE', updatedat = NOW()`,
      [product.id, wholesaler.businessId, product.categoryId, product.name, product.slug, product.sku, product.description, product.brand, product.fabricmaterial]
    );
  }

  const variants = [
    { id: 'd1111111-1111-4111-8111-111111111111', productId: products[0].id, sku: 'ATN-TEE-001-M-INK', size: 'M', color: 'Ink', costPrice: 8.5, b2bSellingPrice: 14.5, mrp: 32, discount: 55, minOrderQuantity: 24 },
    { id: 'd2222222-2222-4222-8222-222222222222', productId: products[1].id, sku: 'ATN-SHT-002-M-SAND', size: 'M', color: 'Sand', costPrice: 15, b2bSellingPrice: 26, mrp: 58, discount: 55, minOrderQuantity: 12 },
    { id: 'd3333333-3333-4333-8333-333333333333', productId: products[2].id, sku: 'ATN-PNT-003-32-OLIVE', size: '32', color: 'Olive', costPrice: 13.25, b2bSellingPrice: 22.75, mrp: 49, discount: 54, minOrderQuantity: 36 },
    { id: 'd4444444-4444-4444-8444-444444444444', productId: products[3].id, sku: 'ATN-JKT-004-M-RUST', size: 'M', color: 'Rust', costPrice: 22, b2bSellingPrice: 38, mrp: 89, discount: 57, minOrderQuantity: 12 },
  ];

  for (const variant of variants) {
    await pool.query(
      `INSERT INTO "ProductVariant"
         (id, "productId", sku, size, color, "costPrice", "b2bSellingPrice", mrp, discount, "minOrderQuantity", "inventoryTracked", productstatus, createdat, updatedat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, 'ACTIVE', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET "b2bSellingPrice" = $7, mrp = $8, discount = $9, "minOrderQuantity" = $10, updatedat = NOW()`,
      [variant.id, variant.productId, variant.sku, variant.size, variant.color, variant.costPrice, variant.b2bSellingPrice, variant.mrp, variant.discount, variant.minOrderQuantity]
    );
  }
}

async function seedClient() {
  await upsertBusiness({ businessId: client.businessId, businessName: client.businessName, businessType: 'CLIENT' });
  await upsertMembership({ membershipId: client.membershipId, userId: client.userId, businessId: client.businessId });

  await pool.query('DELETE FROM "ClientProfile" WHERE "businessId" = $1', [client.businessId]);
  await pool.query(
    `INSERT INTO "ClientProfile"
       (id, "businessId", companygstnumber, pannumber, contactpersonname, contactpersontitle, annualpurchasevolume, creditlimit, paymentterms, createdat, updatedat)
     VALUES ($1, $2, 'GST-UR-2291', 'PAN-7719-JL', 'Jordan Lee', 'Head of Buying', 180000, 25000, 'NET_30', NOW(), NOW())`,
    [client.profileId, client.businessId]
  );
}

async function main() {
  const admin = await upsertAccount(accounts[0]);
  const wholesalerUser = await upsertAccount({ ...accounts[1], userId: wholesaler.userId });
  const clientUser = await upsertAccount({ ...accounts[2], userId: client.userId });

  wholesaler.userId = wholesalerUser;
  client.userId = clientUser;

  await seedWholesaler();
  await seedClient();

  console.log('\nDemo accounts ready:\n');
  console.log('Role        Email                    Password');
  console.log('----------  -----------------------  --------------');
  console.log('Admin       admin@b2b.com            admin123');
  console.log('Wholesaler  wholesaler@b2b.com       wholesale123');
  console.log('Client      client@b2b.com           client123');
  console.log('\nBusinesses:');
  console.log('  Wholesaler -> Atelier North Studio (WHOLESALER, verified)');
  console.log('  Client     -> Urban Threads Retail (CLIENT, verified)');
  console.log('  Admin id   ->', admin);
  console.log('');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
