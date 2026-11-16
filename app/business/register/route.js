import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { pool } from "../../../lib/db";

export const dynamic = "force-dynamic";

const BUSINESS_TYPES = ["WHOLESALER", "CLIENT"];

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      businessName,
      businessType,
      cinNumber,
      panNumber,
      bankAccountName,
      bankAccountNumber,
      bankName,
      ifscCode,
      approvedLimit,
      country,
    } = body;

    if (!businessName || !BUSINESS_TYPES.includes(businessType)) {
      return NextResponse.json(
        { error: "businessName and a valid businessType are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const businessId = randomUUID();
      const tenantId = `tenant_${Date.now()}`;

      await client.query(
        `INSERT INTO "Business"
           (id, name, type, "verificationStatus", currency, country, status, createdat, updatedat)
         VALUES ($1, $2, $3, 'PENDING_VERIFICATION', 'NPR', $4, 'ACTIVE', NOW(), NOW())`,
        [businessId, businessName, businessType, country || "NP"]
      );

      if (businessType === "WHOLESALER") {
        await client.query(
          `INSERT INTO "WholesalerProfile"
             (id, "businessId", cinnumber, pannumber, bankaccountname, bankaccountnumber,
              bankname, ifsccode, approvedlimit, createdat, updatedat)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            randomUUID(),
            businessId,
            cinNumber || null,
            panNumber || null,
            bankAccountName || null,
            bankAccountNumber || null,
            bankName || null,
            ifscCode || null,
            Number.parseFloat(approvedLimit) || 0,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO "ClientProfile"
             (id, "businessId", companygstnumber, pannumber, contactpersonname,
              creditlimit, paymentterms, createdat, updatedat)
           VALUES ($1, $2, $3, $4, $5, 0, 'NET_30', NOW(), NOW())`,
          [
            randomUUID(),
            businessId,
            cinNumber || null,
            panNumber || null,
            session.user.name || null,
          ]
        );
      }

      await client.query(
        `INSERT INTO "BusinessMembership"
           (id, "userId", "businessId", role, status, "joinedAt")
         VALUES ($1, $2, $3, 'OWNER', 'ACTIVE', NOW())`,
        [randomUUID(), userId, businessId]
      );

      await client.query(
        `INSERT INTO "Tenant" (id, name, ownerid, plan, status)
         VALUES ($1, $2, $3, 'free', 'active')`,
        [tenantId, businessName, userId]
      );

      await client.query(
        `UPDATE "User" SET status = 'ACTIVE', "updatedAt" = NOW() WHERE id = $1`,
        [userId]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Business registration submitted successfully",
          businessId,
          status: "PENDING_VERIFICATION",
        },
        { status: 201 }
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Business registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit business registration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
