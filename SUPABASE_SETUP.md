# Supabase Database Setup Guide

This guide will help you set up the required Supabase tables for the FoodHub application.

## Required Tables

### 1. `profiles` Table
Stores user profile information including role-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('restaurant', 'delivery', 'customer')),
  phone TEXT,
  address TEXT,
  city TEXT,
  pincode TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  restaurant_name TEXT,
  cuisine_type TEXT,
  vehicle_type TEXT,
  license_number TEXT,
  landmark TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Anyone can view restaurant profiles
CREATE POLICY "Anyone can view restaurant profiles" ON profiles
  FOR SELECT USING (role = 'restaurant');

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. `dishes` Table
Stores restaurant dishes with variants.

```sql
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available dishes
CREATE POLICY "Anyone can view dishes" ON dishes
  FOR SELECT USING (true);

-- Policy: Restaurant owners can manage their dishes
CREATE POLICY "Restaurants can manage own dishes" ON dishes
  FOR ALL USING (
    auth.uid() = restaurant_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'restaurant'
      AND profiles.user_id = dishes.restaurant_id
    )
  );
```

### 3. `orders` Table
Stores customer orders.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  delivery_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'out_for_delivery', 'completed', 'rejected')),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Policy: Restaurants can view their orders
CREATE POLICY "Restaurants can view own orders" ON orders
  FOR SELECT USING (auth.uid() = restaurant_id);

-- Policy: Delivery partners can view assigned orders
CREATE POLICY "Delivery can view assigned orders" ON orders
  FOR SELECT USING (auth.uid() = delivery_id OR status = 'ready');

-- Policy: Customers can create orders
CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Policy: Restaurants can update their orders
CREATE POLICY "Restaurants can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = restaurant_id);

-- Policy: Delivery can update assigned orders
CREATE POLICY "Delivery can update assigned orders" ON orders
  FOR UPDATE USING (auth.uid() = delivery_id);
```

### 4. `order_items` Table
Stores individual items in each order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  variant TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view order items for orders they have access to
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.restaurant_id = auth.uid() OR
        orders.delivery_id = auth.uid()
      )
    )
  );

-- Policy: Customers can create order items
CREATE POLICY "Customers can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );
```

### 5. `delivery_locations` Table
Tracks delivery partner locations for real-time tracking.

```sql
CREATE TABLE delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Delivery partners can manage their location
CREATE POLICY "Delivery can manage own location" ON delivery_locations
  FOR ALL USING (auth.uid() = delivery_id);

-- Policy: Customers can view delivery locations for their orders
CREATE POLICY "Customers can view delivery locations" ON delivery_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.delivery_id = delivery_locations.delivery_id
      AND orders.customer_id = auth.uid()
      AND orders.status IN ('assigned', 'out_for_delivery')
    )
  );
```

### 6. `order_status_history` Table (NEW)
Tracks order status changes for timeline.

```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view status history for their orders
CREATE POLICY "Users can view order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.restaurant_id = auth.uid() OR
        orders.delivery_id = auth.uid()
      )
    )
  );

-- Policy: System can insert status history (via triggers)
CREATE POLICY "System can insert status history" ON order_status_history
  FOR INSERT WITH CHECK (true);
```

### 7. `dish_ratings` Table (NEW)
Stores ratings and reviews for dishes.

```sql
CREATE TABLE dish_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dish_id, order_id, customer_id)
);

-- Enable RLS
ALTER TABLE dish_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings
CREATE POLICY "Anyone can view ratings" ON dish_ratings
  FOR SELECT USING (true);

-- Policy: Customers can create ratings for their orders
CREATE POLICY "Customers can create ratings" ON dish_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = dish_ratings.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- Policy: Customers can update their own ratings
CREATE POLICY "Customers can update own ratings" ON dish_ratings
  FOR UPDATE USING (auth.uid() = customer_id);
```

## Triggers

### Trigger to automatically log status changes

```sql
-- Function to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on orders table
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
```

### Trigger to update updated_at timestamp

```sql
-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add these to your `.env` file in the `frontend` directory:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Notes

1. **Row Level Security (RLS)**: All tables have RLS enabled for security. Adjust policies as needed for your use case.

2. **Triggers**: The triggers automatically log status changes and update timestamps.

3. **Indexes**: Consider adding indexes on frequently queried columns like `restaurant_id`, `customer_id`, `status`, `dish_id`, etc.

4. **Storage**: For dish images, you can use Supabase Storage. Create a bucket called `dish-images` and update the storage policies accordingly.

5. **Real-time**: Consider enabling Supabase Realtime for live order updates and delivery tracking.
