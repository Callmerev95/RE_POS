import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";


const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB 
const BUCKET = "product-images";

function extFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg"; 
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const productId = (form.get("productId") as string) ?? null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file melebihi 2MB" }, { status: 400 });
    }

    const extension = extFromMime(file.type);
    const path = `products/${productId}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ publicUrl: publicData?.publicUrl ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message ?? "Upload gagal" }, { status: 500 });
  }
}
