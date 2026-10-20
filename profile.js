import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://rmvmwpldqgahfnknckhh.supabase.co";

// Use the same publishable key as login.js.
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const fileInput = document.getElementById("avatar-file");
const uploadButton = document.getElementById("upload-avatar");
const avatarStatus = document.getElementById("avatar-status");

async function loadAvatar() {
  const { data: { user }, error } =
    await supabase.auth.getUser();

  if (error || !user) {
    avatarStatus.textContent = "Please log in first.";
    return;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError) {
    avatarStatus.textContent =
      "Could not load your profile picture.";
    console.error(profileError);
    return;
  }

  if (data?.avatar_url) {
    window.setProfileAvatar(data.avatar_url);
  }
}

uploadButton.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if (!file) {
    avatarStatus.textContent = "Choose an image first.";
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    avatarStatus.textContent =
      "Use a PNG, JPG, or WebP image.";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    avatarStatus.textContent =
      "Image must be smaller than 2 MB.";
    return;
  }

  uploadButton.disabled = true;
  avatarStatus.textContent = "Uploading picture...";

  try {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Please log in before uploading.");
    }

    const extension = file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";

    const filePath =
      `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

    if (uploadError) throw uploadError;

    const { data: publicData } =
      supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    const avatarUrl = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    window.setProfileAvatar(avatarUrl);

    avatarStatus.textContent =
      "Profile picture saved!";
  } catch (error) {
    console.error(error);
    avatarStatus.textContent =
      error.message || "Upload failed.";
  } finally {
    uploadButton.disabled = false;
  }
});

loadAvatar();
