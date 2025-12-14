import { Hono, Context } from 'hono';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { 
  users,
  userRoleRequests,
  userRoleVerifications
} from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { Bindings } from '../index';
import { ROLES, hasPermission, PERMISSIONS, canVerifyRoles } from '../db/schema/roles';

const roleRoutes = new Hono<{
  Bindings: Bindings;
  Variables: { db: DrizzleD1Database };
}>();

// Get user's current role
roleRoutes.get('/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!user) {
      return c.text('User not found', 404);
    }
    
    return c.json({ 
      userId: user.id,
      role: user.role || ROLES.LEARNER,
      username: user.username
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Request a role upgrade
roleRoutes.post('/request', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const { userId, requestedRole, reason } = await c.req.json();
    
    // Get user's current role
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!user) {
      return c.text('User not found', 404);
    }
    
    const currentRole = user.role || ROLES.LEARNER;
    
    // Validate requested role
    if (!Object.values(ROLES).includes(requestedRole)) {
      return c.text('Invalid role requested', 400);
    }
    
    // Check if user already has this role
    if (currentRole === requestedRole) {
      return c.text('User already has this role', 400);
    }
    
    // Create role request
    const result = await db
      .insert(userRoleRequests)
      .values({
        userId,
        requestedRole,
        currentRole,
        reason,
        status: 'pending',
      })
      .execute();
    
    return c.json({
      success: true,
      message: 'Role upgrade request submitted successfully',
      requestId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating role request:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Get user's role requests
roleRoutes.get('/requests/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    const requests = await db
      .select()
      .from(userRoleRequests)
      .where(eq(userRoleRequests.userId, userId))
      .orderBy(desc(userRoleRequests.createdAt))
      .all();
    
    return c.json(requests);
  } catch (error) {
    console.error('Error fetching role requests:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Get all pending role requests (for maintainers)
roleRoutes.get('/requests/pending', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    const requests = await db
      .select()
      .from(userRoleRequests)
      .where(eq(userRoleRequests.status, 'pending'))
      .orderBy(desc(userRoleRequests.createdAt))
      .all();
    
    return c.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Approve or reject a role request (maintainers only)
roleRoutes.post('/requests/:requestId/review', async (c) => {
  try {
    const requestId = parseInt(c.req.param('requestId'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const { reviewerId, action } = await c.req.json(); // action: 'approve' or 'reject'
    
    // Verify reviewer has permission
    const reviewer = await db.select().from(users).where(eq(users.id, reviewerId)).get();
    if (!reviewer || !canVerifyRoles(reviewer.role as any)) {
      return c.text('Insufficient permissions', 403);
    }
    
    // Get the request
    const request = await db
      .select()
      .from(userRoleRequests)
      .where(eq(userRoleRequests.id, requestId))
      .get();
    
    if (!request) {
      return c.text('Request not found', 404);
    }
    
    if (request.status !== 'pending') {
      return c.text('Request has already been reviewed', 400);
    }
    
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    // Update request status
    await db
      .update(userRoleRequests)
      .set({
        status: newStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(userRoleRequests.id, requestId))
      .execute();
    
    // If approved, update user's role
    if (action === 'approve') {
      await db
        .update(users)
        .set({ role: request.requestedRole })
        .where(eq(users.id, request.userId))
        .execute();
    }
    
    return c.json({
      success: true,
      message: `Request ${newStatus} successfully`,
      newRole: action === 'approve' ? request.requestedRole : request.currentRole
    });
  } catch (error) {
    console.error('Error reviewing role request:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Submit verification evidence for Native Speaker or Contributor
roleRoutes.post('/verify', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const { userId, role, evidence } = await c.req.json();
    
    // Validate role
    if (role !== ROLES.NATIVE_SPEAKER && role !== ROLES.CONTRIBUTOR) {
      return c.text('Verification only available for Native Speaker and Contributor roles', 400);
    }
    
    // Create verification record
    const result = await db
      .insert(userRoleVerifications)
      .values({
        userId,
        role,
        evidence,
        status: 'pending',
      })
      .execute();
    
    return c.json({
      success: true,
      message: 'Verification submitted successfully',
      verificationId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Get pending verifications (for maintainers)
roleRoutes.get('/verifications/pending', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    const verifications = await db
      .select()
      .from(userRoleVerifications)
      .where(eq(userRoleVerifications.status, 'pending'))
      .orderBy(desc(userRoleVerifications.createdAt))
      .all();
    
    return c.json(verifications);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Review a verification (maintainers only)
roleRoutes.post('/verifications/:verificationId/review', async (c) => {
  try {
    const verificationId = parseInt(c.req.param('verificationId'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const { reviewerId, action } = await c.req.json();
    
    // Verify reviewer has permission
    const reviewer = await db.select().from(users).where(eq(users.id, reviewerId)).get();
    if (!reviewer || !canVerifyRoles(reviewer.role as any)) {
      return c.text('Insufficient permissions', 403);
    }
    
    // Get the verification
    const verification = await db
      .select()
      .from(userRoleVerifications)
      .where(eq(userRoleVerifications.id, verificationId))
      .get();
    
    if (!verification) {
      return c.text('Verification not found', 404);
    }
    
    if (verification.status !== 'pending') {
      return c.text('Verification has already been reviewed', 400);
    }
    
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    // Update verification status
    await db
      .update(userRoleVerifications)
      .set({
        status: newStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(userRoleVerifications.id, verificationId))
      .execute();
    
    // If approved, update user's role
    if (action === 'approve') {
      await db
        .update(users)
        .set({ role: verification.role })
        .where(eq(users.id, verification.userId))
        .execute();
    }
    
    return c.json({
      success: true,
      message: `Verification ${newStatus} successfully`
    });
  } catch (error) {
    console.error('Error reviewing verification:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Check user permissions
roleRoutes.get('/permissions/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!user) {
      return c.text('User not found', 404);
    }
    
    const userRole = (user.role || ROLES.LEARNER) as any;
    
    return c.json({
      role: userRole,
      permissions: {
        canSubmitContent: hasPermission(userRole, PERMISSIONS.SUBMIT_CONTENT),
        canVerifyTranslations: hasPermission(userRole, PERMISSIONS.VERIFY_TRANSLATIONS),
        canApproveContent: hasPermission(userRole, PERMISSIONS.APPROVE_CONTENT),
        canModerateComments: hasPermission(userRole, PERMISSIONS.MODERATE_COMMENTS),
        canManageUsers: hasPermission(userRole, PERMISSIONS.MANAGE_USERS),
        canVerifyRoles: hasPermission(userRole, PERMISSIONS.VERIFY_ROLES),
      }
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    return c.text('Internal Server Error', 500);
  }
});

export default roleRoutes;
