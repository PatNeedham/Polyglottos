# User Account Type System

This document describes the multi-tier user role system with role-based permissions in Polyglottos.

## User Roles

The platform supports four distinct user roles, each with specific permissions and capabilities:

### 1. Learner (Default)
- **Icon**: 📚
- **Color**: #4A90E2 (Blue)
- **Description**: Access learning materials, take quizzes, and track your progress
- **Permissions**:
  - View content
  - Take quizzes
  - Track progress

### 2. Contributor
- **Icon**: ✍️
- **Color**: #7B68EE (Medium Slate Blue)
- **Description**: Submit content, comment on lessons, and help improve materials
- **Permissions**:
  - All Learner permissions
  - Submit content
  - Comment on content

### 3. Native Speaker
- **Icon**: 🗣️
- **Color**: #50C878 (Emerald Green)
- **Description**: Verify translations, provide pronunciation help, and validate content
- **Permissions**:
  - All Learner permissions
  - Submit content
  - Comment on content
  - Verify translations
  - Provide pronunciation guidance

### 4. Maintainer
- **Icon**: ⚙️
- **Color**: #FFD700 (Gold)
- **Description**: Moderate content, manage users, and maintain the platform
- **Permissions**:
  - All permissions from previous roles
  - Approve content
  - Moderate comments
  - Manage users
  - Verify role upgrade requests

## Role Upgrade System

Users can request upgrades to higher roles through a structured process:

### Requesting a Role Upgrade

1. Navigate to your profile page
2. Click "Request Role Upgrade" button
3. Select the desired role
4. Provide a reason for the request (optional but recommended)
5. Submit the request

### Request Review Process

- All role upgrade requests are reviewed by Maintainers
- Requests can be approved or rejected
- Users can view the status of their requests on their profile page
- Request statuses:
  - **Pending** (⏱): Awaiting review
  - **Approved** (✓): Request accepted, role upgraded
  - **Rejected** (✗): Request denied

## Role Verification System

For sensitive roles like Native Speaker and Contributor, users can submit verification evidence:

### Submitting Verification

1. Access the verification form from your profile
2. Select the role you want to verify
3. Provide evidence (e.g., language certificates, native speaker proof)
4. Submit for review

### Verification Review

- Maintainers review all verification submissions
- Evidence is evaluated for authenticity
- Approved verifications result in automatic role upgrade

## API Endpoints

### Role Management

- `GET /roles/user/:userId` - Get user's current role
- `POST /roles/request` - Submit a role upgrade request
- `GET /roles/requests/user/:userId` - Get user's role requests
- `GET /roles/requests/pending` - Get all pending requests (Maintainers only)
- `POST /roles/requests/:requestId/review` - Approve/reject a request (Maintainers only)

### Role Verification

- `POST /roles/verify` - Submit verification evidence
- `GET /roles/verifications/pending` - Get pending verifications (Maintainers only)
- `POST /roles/verifications/:verificationId/review` - Review verification (Maintainers only)

### Permissions

- `GET /roles/permissions/:userId` - Get user's permissions

## Frontend Components

### RoleBadge
Displays a user's role with icon and color coding.

```tsx
import RoleBadge from '~/components/RoleBadge';

<RoleBadge role={user.role} size="medium" showIcon={true} />
```

### RoleUpgradeRequest
Form component for submitting role upgrade requests.

```tsx
import RoleUpgradeRequest from '~/components/RoleUpgradeRequest';

<RoleUpgradeRequest 
  userId={user.id}
  currentRole={user.role}
  onRequestSubmitted={handleSubmit}
/>
```

### RoleRequestsList
Displays a user's role upgrade request history.

```tsx
import RoleRequestsList from '~/components/RoleRequestsList';

<RoleRequestsList userId={user.id} refreshTrigger={counter} />
```

## Database Schema

### users table
- Added `role` column (text, default: 'learner')

### user_role_requests table
- `id` - Primary key
- `user_id` - Foreign key to users
- `requested_role` - Role being requested
- `current_role` - User's current role
- `reason` - Explanation for the request
- `status` - pending/approved/rejected
- `reviewed_by` - Foreign key to users (reviewer)
- `reviewed_at` - Review timestamp
- `created_at` - Request timestamp

### user_role_verifications table
- `id` - Primary key
- `user_id` - Foreign key to users
- `role` - Role being verified
- `evidence` - Verification evidence
- `status` - pending/approved/rejected
- `reviewed_by` - Foreign key to users (reviewer)
- `reviewed_at` - Review timestamp
- `created_at` - Submission timestamp

## Permission Checking

Use the permission helper functions to check user capabilities:

```typescript
import { hasPermission, canSubmitContent, PERMISSIONS } from '~/types/roles';

// Check specific permission
if (hasPermission(userRole, PERMISSIONS.SUBMIT_CONTENT)) {
  // Show content submission form
}

// Check content submission capability
if (canSubmitContent(userRole)) {
  // Allow content submission
}
```

## UI Implementation

### Role-Based Feature Visibility

Features are shown/hidden based on user permissions:

- Content submission forms: Contributor+ only
- Translation verification: Native Speaker+ only
- Content moderation: Maintainer only
- User management: Maintainer only

### Role Badges

Role badges are displayed in:
- User profiles
- Comment threads
- Leaderboards
- User lists (for maintainers)

## Security Considerations

1. All role changes are logged and auditable
2. Maintainer actions require authentication
3. Permission checks occur on both frontend and backend
4. Role verification requires evidence review
5. Users cannot self-upgrade roles without approval

## Future Enhancements

- Email notifications for role request updates
- Achievement-based automatic role upgrades
- Role-specific leaderboards and statistics
- Time-based role trials (temporary upgrades)
- Community voting on role requests
