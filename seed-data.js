const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

async function seed() {
  const client = await pool.connect();
  
  try {
    // Check existing data first
    const existingCategories = await client.query('SELECT COUNT(*) AS count FROM "Category"');
    const existingProducts = await client.query('SELECT COUNT(*) AS count FROM "Product"');
    const existingUsers = await client.query('SELECT COUNT(*) AS count FROM "User"');
    
    console.log('Existing data - Categories:', existingCategories.rows[0].count, 'Products:', existingProducts.rows[0].count, 'Users:', existingUsers.rows[0].count);
    
    // 1. Insert categories if none exist
    if (parseInt(existingCategories.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO "Category" (id, name, slug, description, "isactive", sortorder)
        VALUES 
          ('${uuidv4()}', 'Men''s Clothing', 'mens-clothing', 'Men''s apparel and garments', true, 1),
          ('${uuidv4()}', 'Women''s Clothing', 'womens-clothing', 'Women''s apparel and garments', true, 2),
          ('${uuidv4()}', 'Kids'' Clothing', 'kids-clothing', 'Children''s apparel and garments', true, 3),
          ('${uuidv4()}', 'Accessories', 'accessories', 'Fashion accessories and add-ons', true, 4)
      `);
      console.log('   - 4 categories created');
    } else {
      console.log('   - Categories already exist, skipping');
    }
    
    // 2. Insert sample products if none exist
    if (parseInt(existingProducts.rows[0].count) === 0) {
      const businessId = 'biz-demo';
      await client.query(`
        INSERT INTO "Product" (id, "businessId", name, slug, "sku", description, brand, "fabricmaterial", "productstatus")
        VALUES 
          ('${uuidv4()}', '${businessId}', 'Premium Cotton T-Shirt', 'premium-cotton-tshirt', 'SKU-MTS-001', '100% combed cotton t-shirt, available in multiple colors', 'UrbanThread', '100% Cotton', 'ACTIVE'),
          ('${uuidv4()}', '${businessId}', 'Wool Business Suit', 'wool-business-suit', 'SKU-BSU-002', 'Two-piece wool business suit, charcoal gray', 'CorporateWear', 'Premium Wool', 'ACTIVE'),
          ('${uuidv4()}', '${businessId}', 'Silk Blouse', 'silk-blouse', 'SKU-SBL-003', 'Silk chiffon blouse, available in pastel shades', 'ElegantSilk', 'Silk blend', 'ACTIVE')
      `);
      console.log('   - 3 products created');
    } else {
      console.log('   - Products already exist, skipping');
    }
    
    // 3. Insert business/wholesaler only if no business exists
    const businessCheck = await client.query("SELECT COUNT(*) AS count FROM \"Business\" WHERE name = 'Demo Wholesale Co'");
    if (parseInt(businessCheck.rows[0].count) === 0) {
      const businessId = 'biz-demo';
      await client.query(`
        INSERT INTO "Business" (id, name, type, "verificationStatus", currency, country, status)
        VALUES ('${businessId}', 'Demo Wholesale Co', 'WHOLESALER', 'PENDING_VERIFICATION', 'USD', 'US', 'ACTIVE')
      `);
      
      await client.query(`
        INSERT INTO "WholesalerProfile" (id, "businessId", "cinnumber", "panNumber", "bankAccountName", "bankAccountNumber", "bankName", "bankBranch", "ifsccode", "approvedLimit")
        VALUES ('${uuidv4()}', '${businessId}', 'DEMO123456', 'ABCDE1234F', 'Demo Wholesale Co', '9876543210', 'Demo Bank', 'Branch A', 'ABCD0012345', 50000.00)
      `);
      console.log('   - Business and wholesaler profile created');
    } else {
      console.log('   - Business already exists, skipping');
    }
    
    // 4. Create tenant only if no tenant exists
    const tenantCheck = await client.query('SELECT COUNT(*) AS count FROM "Tenant"');
    if (parseInt(tenantCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO "Tenant" (id, name, ownerId, plan, status)
        VALUES ('tenant_1', 'Demo Wholesale', '${uuidv4()}', 'free', 'active')
      `);
      console.log('   - Tenant created for demo business');
    } else {
      console.log('   - Tenant already exists, skipping');
    }
    
    // 5. Update user status to verified only if user exists
    const userCheck = await client.query('SELECT COUNT(*) AS count FROM "User" WHERE email = \'admin@b2b.com\'');
    if (parseInt(userCheck.rows[0].count) > 0) {
      await client.query(`
        UPDATE "User" SET status = 'verified' WHERE email = 'admin@b2b.com'
      `);
      console.log('   - Admin user verified');
    } else {
      console.log('   - Admin user not found, skipping verification update');
    }
    
    console.log('\n✅ Database seeding complete!');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();