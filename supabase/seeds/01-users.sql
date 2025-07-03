-- Seed Users
-- User 1: curious@curiouscat.consulting -> 11111111-1111-1111-1111-111111111111
-- User 2: curious+2@curiouscat.consulting -> 22222222-2222-2222-2222-222222222222  
-- User 3: curious+3@curiouscat.consulting -> 33333333-3333-3333-3333-333333333333

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'curious@curiouscat.consulting',
  crypt('H047cCHxg7oDhmp0O6*D', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Curious Cat","avatar_url":"https://th.bing.com/th/id/OIP.Q6R49EFCR62g4QtakGPRFAHaHZ?rs=1&pid=ImgDetMain&cb=idpwebpc1"}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
);
