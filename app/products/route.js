import { Pool } from 'pg';
import { v4 } from 'uuid';

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

// GET - List products for the authenticated user's tenant
export default async function handler(request, response) {
  try {
    const tenantId = request.query.tenantId || 'tenant_1';
    
    const result = await pool.query(
      `SELECT id, name, "sku", "fabricmaterial", "brand", "productstatus", "createdat" 
       FROM "Product" 
       WHERE "businessId" IN (
         SELECT "businessId" FROM "WholesalerProfile" 
         WHERE id IN (
           SELECT "ownerId" FROM "Tenant" WHERE id = \$1
         )
       )
       ORDER BY "createdat" DESC`,
      [tenantId]
    );
    
    response.status(200).json({
      success: true,
      products: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
}

// POST - Create a new product
export async function POST(request, response) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      brand,
      fabricMaterial,
      description,
      basePrice,
      minOrderQuantity,
      productStatus,
    } = body;

    const tenantId = request.cookies?.tenantId || 'tenant_1';
    const userId = request.cookies?.userId || '8f29132c-94df-4901-9ee1-c74e36a38103';
    const businessId = request.cookies?.businessId || 'biz-demo';
    
    const productId = v4();
    
    await pool.query(
      `INSERT INTO "Product" ("id", "businessId", "name", "slug", "sku", "description", "brand", "fabricmaterial", "productstatus", "createdat", "updatedat")
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, NOW(), NOW())`,
      [productId, businessId, name, name.toLowerCase().replace(/[^\w]+/g, '-').substring(0, 50), sku, description, brand, fabricMaterial, productStatus || 'active']
    );
    
    response.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId
    });
  } catch (error) {
    console.error('Create product error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
}

// PUT - Update product status
export async function PUT(request, response) {
  try {
    const { productId, productStatus } = await request.json();
    
    await pool.query(
      `UPDATE "Product" SET "productstatus" = \$1, "updatedat" = NOW() WHERE id = \$2`,
      [productStatus, productId]
    );
    
    response.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
}

// DELETE - Delete product
export async function DELETE(request, response) {
  try {
    const { productId } = await request.json();
    
    await pool.query(
      `DELETE FROM "Product" WHERE id = \$1`,
      [productId]
    );
    
    response.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
}