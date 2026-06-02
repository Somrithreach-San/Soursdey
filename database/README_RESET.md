# Database Reset Instructions

## Files Created

1. **clear_user_data.sql** - Clear all user profiles and progress (keeps game content)
2. **reset_single_user.sql** - Reset a specific user account
3. **add_missing_columns.sql** - Add missing columns to profiles table

## How to Use

### 1. Clear All User Data (Keep Game Content)
Use this when you want to reset users but keep your units, store items, and lessons intact.

**Steps:**
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the first section from `clear_user_data.sql` (lines 1-26)
5. Click **Run**

This will delete:
- All user profiles
- User progress
- User quests
- User mistakes
- User inventory

### 2. Reset a Single User
Use this when you want to delete data for one specific user.

**Steps:**
1. Replace `'user@example.com'` with the actual email
2. Go to Supabase **SQL Editor**
3. Copy the first section from `reset_single_user.sql`
4. Modify the email address
5. Click **Run**

### 3. Full Nuclear Reset
Use this only if you want to completely wipe the database (including all game content).

**Steps:**
1. Go to `clear_user_data.sql`
2. Uncomment the **Option 2** section (lines 34-45)
3. Copy and paste into Supabase SQL Editor
4. Click **Run**

## Verification

After running any script, check that data was cleared:

```sql
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as progress_count FROM user_progress;
SELECT COUNT(*) as quest_count FROM user_quests;
```

## Important Notes

⚠️ **These operations are permanent and cannot be undone!**

- Always test on a development database first
- Keep backups before running these scripts
- If you delete auth users, they won't be able to log in until they sign up again
- Supabase has CASCADE delete enabled, so deleting profiles automatically cleans up related records
