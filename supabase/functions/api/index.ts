import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api', '');

    // Get equipment with filters
    if (req.method === 'GET' && path === '/equipment') {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get equipment by ID
    if (req.method === 'GET' && path.match(/^\/equipment\/[\w-]+$/)) {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create equipment
    if (req.method === 'POST' && path === '/equipment') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('equipment')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update equipment
    if (req.method === 'PUT' && path.match(/^\/equipment\/[\w-]+$/)) {
      const id = path.split('/')[2];
      const body = await req.json();
      const { data, error } = await supabase
        .from('equipment')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete equipment
    if (req.method === 'DELETE' && path.match(/^\/equipment\/[\w-]+$/)) {
      const id = path.split('/')[2];
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get rentals
    if (req.method === 'GET' && path === '/rentals') {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            price,
            image
          ),
          renter:renter_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create rental
    if (req.method === 'POST' && path === '/rentals') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('rentals')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update rental status
    if (req.method === 'PUT' && path.match(/^\/rentals\/[\w-]+\/status$/)) {
      const id = path.split('/')[2];
      const { status } = await req.json();
      const { data, error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get users
    if (req.method === 'GET' && path === '/users') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user
    if (req.method === 'PUT' && path.match(/^\/users\/[\w-]+$/)) {
      const id = path.split('/')[2];
      const body = await req.json();
      const { data, error } = await supabase
        .from('users')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});