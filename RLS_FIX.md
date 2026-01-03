# Quick Fix: Restaurants Not Showing for Customers

## Problem
Restaurants are not visible on the customer dashboard due to Row Level Security (RLS) policies in Supabase.

## Solution

You need to add an RLS policy that allows customers (and anyone) to view restaurant profiles. Run this SQL in your Supabase SQL Editor:

```sql
-- Allow anyone to view restaurant profiles
CREATE POLICY "Anyone can view restaurant profiles" ON profiles
  FOR SELECT USING (role = 'restaurant');
```

## Steps to Fix

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL command above
4. Refresh your customer dashboard

## Alternative: If you want to be more restrictive

If you only want authenticated users to view restaurants:

```sql
-- Allow authenticated users to view restaurant profiles
CREATE POLICY "Authenticated users can view restaurant profiles" ON profiles
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' 
    AND role = 'restaurant'
  );
```

## Verify the Fix

After running the SQL, check:
1. The policy appears in **Authentication > Policies** for the `profiles` table
2. Restaurants now appear on the customer dashboard
3. Check browser console for any errors

## Full RLS Policy Setup

For a complete setup, your `profiles` table should have these policies:

1. **Users can view own profile** - `auth.uid() = user_id`
2. **Anyone can view restaurant profiles** - `role = 'restaurant'` (NEW - this is what was missing!)
3. **Users can update own profile** - `auth.uid() = user_id`
4. **Users can insert own profile** - `auth.uid() = user_id`

## Testing

1. Create a restaurant account and complete registration
2. Log in as a customer
3. You should now see the restaurant in the customer dashboard

