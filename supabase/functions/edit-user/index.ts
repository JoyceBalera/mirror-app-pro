import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get request body
    const { userId, email, password, fullName, role, hasBigFive, hasDesenhoHumano, language } = await req.json();

    // Input validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || typeof userId !== 'string' || !uuidRegex.test(userId)) {
      throw new Error("userId inválido");
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      throw new Error("Email inválido");
    }
    if (!fullName || typeof fullName !== 'string' || fullName.length > 200) {
      throw new Error("Nome completo inválido");
    }
    if (!role || !['user', 'admin'].includes(role)) {
      throw new Error("Role deve ser 'user' ou 'admin'");
    }
    if (password && (typeof password !== 'string' || password.length < 6 || password.length > 128)) {
      throw new Error("Senha deve ter entre 6 e 128 caracteres");
    }

    console.log("Updating user:", userId, { hasBigFive, hasDesenhoHumano });

    // Update user in auth.users
    const updateData: any = {
      email,
      user_metadata: { full_name: fullName },
    };

    if (password) {
      updateData.password = password;
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error("Error updating user:", updateError);
      throw updateError;
    }

    // Update profile with email and language
    const profileUpdate: any = { full_name: fullName, email };
    if (language) {
      profileUpdate.preferred_language = language;
    }
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Update role if changed
    const { data: currentRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (currentRole?.role !== role) {
      const { error: roleUpdateError } = await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);

      if (roleUpdateError) {
        console.error("Error updating role:", roleUpdateError);
        throw roleUpdateError;
      }
    }

    // Update test access permissions
    if (hasBigFive !== undefined || hasDesenhoHumano !== undefined) {
      console.log("Updating test access permissions");
      
      // Check if record exists
      const { data: existingAccess } = await supabaseAdmin
        .from("user_test_access")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingAccess) {
        // Update existing record
        const { error: accessUpdateError } = await supabaseAdmin
          .from("user_test_access")
          .update({
            has_big_five: hasBigFive ?? false,
            has_desenho_humano: hasDesenhoHumano ?? false,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);

        if (accessUpdateError) {
          console.error("Error updating test access:", accessUpdateError);
          throw accessUpdateError;
        }
      } else if (hasBigFive || hasDesenhoHumano) {
        // Create new record only if at least one permission is enabled
        const { error: accessInsertError } = await supabaseAdmin
          .from("user_test_access")
          .insert({
            user_id: userId,
            has_big_five: hasBigFive ?? false,
            has_desenho_humano: hasDesenhoHumano ?? false
          });

        if (accessInsertError) {
          console.error("Error inserting test access:", accessInsertError);
          throw accessInsertError;
        }
      }
    }

    console.log("User updated successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in edit-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
