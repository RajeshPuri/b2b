import { Pool } from 'pg';
import { v4 } from 'uuid';

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(request, response) {
  try {
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
    } = request.body;

    const userId = request.cookies?.userId || '8f29132c-94df-4901-9ee1-c74e36a38103'; // MVP: use known user

    // Create Business record
    const businessId = uuidv4();
    const businessVerificationStatus = 'pending';
    
    await pool.query(
      `INSERT INTO "Business" ("id", name, "type", "verificationStatus", "currency", "country", "status", "createdat", "updatedat")
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, NOW(), NOW())`,
      [businessId, businessName, businessType, businessVerificationStatus, country || 'US', country || 'US', 'active']
    );

    // Create WholesalerProfile record
    const wholesalerId = uuidv4();
    await pool.query(
      `INSERT INTO "WholesalerProfile" ("id", "businessId", "cinnumber", "pannumber", "bankaccountname", "bankaccountnumber", "bankname", "bankname", "ifsccode", "approvedlimit", "createdat", "updatedat")
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, NOW(), NOW())`,
      [wholesalerId, businessId, cinNumber, panNumber, bankAccountName, bankAccountNumber, bankName, ifscCode, parseFloat(approvedLimit)]
    );

    // Create Tenant record linking user to business
    await pool.query(
      `INSERT INTO "Tenant" (id, name, ownerId, plan, status)
       VALUES (\$1, \$2, \$3, \$4, \$5)`,
      [`tenant_${Date.now()}`, businessName, userId, 'free', 'active']
    );

    // Update user status to verified
    await pool.query(
      `UPDATE "User" SET status = 'verified' WHERE id = \$1`,
      [userId]
    );

    response.status(201).json({
      success: true,
      message: 'Business registration submitted successfully',
      businessId,
      wholesalerId,
      status: 'pending_verification'
    });

  } catch (error) {
    console.error('Business registration error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to submit business registration',
      details: error.message
    });
  }
}