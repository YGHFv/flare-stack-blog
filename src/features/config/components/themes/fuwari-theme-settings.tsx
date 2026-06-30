import "@/features/theme/themes/fuwari/styles/preview.css";
import { useFormContext, useWatch } from "react-hook-form";
import { AssetUploadField } from "@/features/config/components/asset-upload-field";
import { RangeField } from "@/features/config/components/site-settings-fields";
import type { SystemConfig } from "@/features/config/config.schema";
import {
  DEFAULT_THEME_BLUR_MAX,
  DEFAULT_THEME_BLUR_MIN,
  DEFAULT_THEME_OPACITY_MAX,
  DEFAULT_THEME_OPACITY_MIN,
  DEFAULT_THEME_TRANSITION_MAX,
  DEFAULT_THEME_TRANSITION_MIN,
  FUWARI_THEME_HUE_MAX,
  FUWARI_THEME_HUE_MIN,
} from "@/features/config/site-config.schema";
import { m } from "@/paraglide/messages";

function FuwariHuePreview() {
  const { control } = useFormContext<SystemConfig>();
  const currentHue = useWatch({
    control,
    name: "site.theme.fuwari.primaryHue",
  });
  const previewHue =
    typeof currentHue === "number" && !Number.isNaN(currentHue)
      ? currentHue
      : 250;

  const previewStyle = {
    "--fuwari-hue": String(previewHue),
  } as React.CSSProperties;

  return (
    <div
      className="fuwari-preview rounded-2xl border border-border/40 bg-background/70 p-4 md:col-span-2"
      style={previewStyle}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {m.settings_site_primary_preview_title()}
          </p>
          <p className="text-xs text-muted-foreground">
            {m.settings_site_primary_preview_desc({ hue: String(previewHue) })}
          </p>
        </div>
        <div
          className="h-10 w-10 shrink-0 rounded-xl border border-black/10 shadow-sm"
          style={{ backgroundColor: "var(--fuwari-primary)" }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="fuwari-card-base rounded-xl border border-black/5 p-4 shadow-sm">
          <div
            className="h-2.5 w-16 rounded-full"
            style={{ backgroundColor: "var(--fuwari-primary)" }}
          />
          <p className="mt-4 text-xs/5 font-medium text-black/45 dark:text-white/45">
            {m.settings_site_primary_preview_card_label()}
          </p>
          <p className="mt-1 text-lg font-semibold text-black/90 dark:text-white/90">
            {m.settings_site_primary_preview_card_title()}
          </p>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {m.settings_site_primary_preview_card_desc()}
          </p>
        </div>

        <button
          type="button"
          className="fuwari-btn-primary h-11 rounded-xl px-4 text-sm font-semibold shadow-sm active:scale-[0.98]"
        >
          {m.settings_site_primary_preview_btn_primary()}
        </button>

        <button
          type="button"
          className="fuwari-btn-regular h-11 rounded-xl px-4 text-sm font-medium shadow-sm active:scale-[0.98]"
        >
          {m.settings_site_primary_preview_btn_tinted()}
        </button>
      </div>
    </div>
  );
}

export function FuwariThemeSettings() {
  const {
    formState: { errors },
  } = useFormContext<SystemConfig>();

  return (
    <>
      <AssetUploadField
        name="site.theme.fuwari.homeBg"
        assetPath="themes/fuwari/home-bg.webp"
        accept=".png,.webp,.jpg,.jpeg"
        label={m.settings_site_field_home_image()}
        hint={m.settings_site_field_home_image_hint()}
        placeholder="/images/asset/themes/fuwari/home-bg.webp or https://picsum.photos/1600/900"
        error={errors.site?.theme?.fuwari?.homeBg?.message}
      />
      <AssetUploadField
        name="site.theme.fuwari.avatar"
        assetPath="themes/fuwari/avatar.png"
        accept=".png,.webp,.jpg,.jpeg"
        readOnly
        label={m.settings_site_field_avatar()}
        error={errors.site?.theme?.fuwari?.avatar?.message}
      />
      <RangeField
        name="site.theme.fuwari.primaryHue"
        label={m.settings_site_field_primary_hue()}
        hint={m.settings_site_field_primary_hue_hint()}
        min={FUWARI_THEME_HUE_MIN}
        max={FUWARI_THEME_HUE_MAX}
        step={1}
        unit="deg"
        defaultValue={250}
        error={errors.site?.theme?.fuwari?.primaryHue?.message}
      />
      <RangeField
        name="site.theme.fuwari.background.light.opacity"
        label={m.settings_site_field_light_opacity()}
        hint={m.settings_site_field_light_opacity_hint()}
        min={DEFAULT_THEME_OPACITY_MIN}
        max={DEFAULT_THEME_OPACITY_MAX}
        step={0.01}
        defaultValue={0.32}
        formatValue={(value) => value.toFixed(2)}
        error={errors.site?.theme?.fuwari?.background?.light?.opacity?.message}
      />
      <RangeField
        name="site.theme.fuwari.background.dark.opacity"
        label={m.settings_site_field_dark_opacity()}
        hint={m.settings_site_field_dark_opacity_hint()}
        min={DEFAULT_THEME_OPACITY_MIN}
        max={DEFAULT_THEME_OPACITY_MAX}
        step={0.01}
        defaultValue={0.22}
        formatValue={(value) => value.toFixed(2)}
        error={errors.site?.theme?.fuwari?.background?.dark?.opacity?.message}
      />
      <RangeField
        name="site.theme.fuwari.background.backdropBlur"
        label={m.settings_site_field_backdrop_blur()}
        hint={m.settings_site_field_backdrop_blur_hint()}
        min={DEFAULT_THEME_BLUR_MIN}
        max={DEFAULT_THEME_BLUR_MAX}
        step={1}
        unit="px"
        defaultValue={0}
        error={errors.site?.theme?.fuwari?.background?.backdropBlur?.message}
      />
      <RangeField
        name="site.theme.fuwari.background.transitionDuration"
        label={m.settings_site_field_transition_duration()}
        hint={m.settings_site_field_transition_duration_hint()}
        min={DEFAULT_THEME_TRANSITION_MIN}
        max={DEFAULT_THEME_TRANSITION_MAX}
        step={50}
        unit="ms"
        defaultValue={300}
        error={
          errors.site?.theme?.fuwari?.background?.transitionDuration?.message
        }
      />
      <FuwariHuePreview />
    </>
  );
}
