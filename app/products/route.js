import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import { query } from "../../lib/db";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["ACTIVE", "ARCHIVED"];

export async function GET() {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.sku, p.brand, p.description, p.fabricmaterial,
              p.productstatus, p.createdat, b.name AS "businessName"
       FROM "Product" p
       JOIN "Business" b ON b.id = p."businessId"
       WHERE p.productstatus = 'ACTIVE'
       ORDER BY p.createdat DESC NULLS LAST
       LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      products: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = session.user.businessId;

  if (!businessId) {
    return NextResponse.json(
      { error: "No business is linked to this account" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, sku, brand, fabricMaterial, description } = body;
    const productStatus = body.productStatus || "ACTIVE";

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(productStatus)) {
      return NextResponse.json(
        { error: "Invalid product status" },
        { status: 400 }
      );
    }

    const productId = randomUUID();
    const slug = name
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    await query(
      `INSERT INTO "Product"
         ("id", "businessId", name, slug, sku, description, brand, fabricmaterial, productstatus, createdat, updatedat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        productId,
        businessId,
        name,
        slug,
        sku || null,
        description || null,
        brand || null,
        fabricMaterial || null,
        productStatus,
      ]
    );

    return NextResponse.json(
      { success: true, message: "Product created successfully", productId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, productStatus } = await request.json();

    if (!productId || !VALID_STATUSES.includes(productStatus)) {
      return NextResponse.json(
        { error: "A valid productId and status are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE "Product"
       SET productstatus = $1, updatedat = NOW()
       WHERE id = $2 AND "businessId" = $3`,
      [productStatus, productId, session.user.businessId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM "Product" WHERE id = $1 AND "businessId" = $2`,
      [productId, session.user.businessId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
