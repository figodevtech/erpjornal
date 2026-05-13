
import { criarClienteSupabaseAdmin } from "./src/lib/supabase/admin";
import dotenv from "dotenv";
dotenv.config();

async function checkBuckets() {
  try {
    const supabase = criarClienteSupabaseAdmin();
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return;
    }
    
    console.log("Available Buckets:");
    data.forEach(b => console.log(`- ${b.name} (Public: ${b.public})`));
  } catch (err) {
    console.error("Script Error:", err);
  }
}

checkBuckets();
