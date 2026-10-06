// Supabase Edge Function: Lynk.id Webhook Receiver
// URL: https://xolgtadrooyrbcgytneo.supabase.co/functions/v1/lynk-webhook
// Automatically marks student payment as LUNAS 100% without manual intervention!

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://xolgtadrooyrbcgytneo.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Received Lynk.id Webhook:", JSON.stringify(payload));

    const data = payload.data || payload;
    const amount = Number(data.amount || data.total || payload.amount || 0);
    const customerName = (data.customer_name || data.name || payload.customer_name || "").trim();
    const customerEmail = (data.customer_email || data.email || payload.customer_email || "").trim().toLowerCase();
    const customerPhone = (data.customer_phone || data.phone || payload.customer_phone || "").trim();
    const productName = (data.product_name || data.item_name || payload.product_name || "").trim();
    const transactionId = data.transaction_id || data.id || `LNK_${Date.now()}`;
    const status = (data.status || payload.status || "PAID").toUpperCase();

    // Verify status
    if (status !== "PAID" && status !== "SUCCESS" && status !== "COMPLETED") {
      return new Response(JSON.stringify({ message: "Ignored, status not paid: " + status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get current cloud state from app_cloud_store
    const { data: storeData, error: storeError } = await supabase
      .from("app_cloud_store")
      .select("state_data")
      .eq("id", "main_store")
      .single();

    if (storeError || !storeData) {
      console.error("Could not fetch app_cloud_store:", storeError);
      return new Response(JSON.stringify({ error: "Store not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const state = storeData.state_data;
    const students = state.profiles || [];
    const bills = state.bills || [];

    // Find student
    let matchedStudent = students.find((s: any) => {
      if (customerEmail && s.email && s.email.toLowerCase() === customerEmail) return true;
      if (customerPhone && s.phone && s.phone.replace(/[^0-9]/g, "") === customerPhone.replace(/[^0-9]/g, "")) return true;
      return false;
    });

    if (!matchedStudent && customerName) {
      const q = customerName.toLowerCase();
      matchedStudent = students.find((s: any) => {
        const sName = (s.full_name || "").toLowerCase();
        return sName === q || sName.includes(q) || q.includes(sName) || (s.nim && q.includes(s.nim.toLowerCase()));
      });
    }

    if (!matchedStudent) {
      matchedStudent = students[0];
    }

    // Find bill
    let matchedBill = bills.find((b: any) => {
      if (productName && b.name.toLowerCase().includes(productName.toLowerCase())) return true;
      return false;
    });

    if (!matchedBill) {
      matchedBill = bills.find((b: any) => b.is_active) || bills[0];
    }

    if (!matchedStudent || !matchedBill) {
      return new Response(JSON.stringify({ error: "Student or Bill not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create payment in state
    const newPayment = {
      id: `m_lnk_${transactionId}`,
      bill_id: matchedBill.id,
      student_id: matchedStudent.id,
      amount: amount > 0 ? amount : matchedBill.amount,
      payment_method: "online",
      payment_date: new Date().toISOString().split("T")[0],
      status: "verified",
      student_note: `Lunas otomatis via Webhook Lynk.id (ID: ${transactionId})`,
      admin_note: `Diverifikasi otomatis 100% oleh Webhook Lynk.id. Produk: ${productName || matchedBill.name}`,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    state.payments = [newPayment, ...(state.payments || [])];

    // Update in Supabase
    await supabase
      .from("app_cloud_store")
      .update({
        state_data: state,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main_store");

    console.log("Successfully auto-verified payment for:", matchedStudent.full_name);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Pembayaran ${matchedStudent.full_name} (${formatCurrency(newPayment.amount)}) otomatis LUNAS!`,
        payment: newPayment,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function formatCurrency(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}
