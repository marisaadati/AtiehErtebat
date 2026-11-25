# ریدیزاین صفحه هوش مصنوعی / نکس‌گپ — atiehertebat.ir/services/ai/

## فایل‌ها
| فایل | کاربرد |
|---|---|
| `index.html` | مارک‌آپ کامل صفحه. فقط بخش بین `START` و `END` (یعنی `<div class="nx-page">…</div>`) را داخل `<main>` قالب بگذارید. هدر و فوتر پیش‌نمایش (`pv-*`) را منتقل نکنید. |
| `nexgap.css` | استایل‌ها. همه‌چیز زیر `.nx-page` اسکوپ شده و از توکن‌های فعلی قالب (`--at-teal`، `--at-btn`، `--at-gutter` و …) استفاده می‌کند. |
| `nexgap.js` | تب‌های پلتفرم، استپر خودکار استودیو، تایپ پرامپت در هیرو، ظاهرشدن هنگام اسکرول و اعتبارسنجی فرم. بدون وابستگی. |
| `assets/` | `nexgap-logo.svg` و `nexgap-mark.svg` (از nexgap.ai). در `assets/images/ai/` قالب کپی و مسیرها را با `get_theme_file_uri()` اصلاح کنید. |
| `assets/studio/` | تصاویر استودیو: شیت کاراکتر (`stage-character.webp`)، سه صحنه (`scene-*.webp`)، فریم‌های استوری‌بورد (`sb-*.webp`)، ویدیوی تولید (`stage-production.mp4`، ۶۴۰×۶۴۰، H.264، بدون صدا، حدود ۱۹۰KB، با پوستر)، بورد ویرایش (`stage-edit.webp`) و مسکات کلاکت. ویدیو فقط وقتی مرحله «تولید» باز است پخش می‌شود و `preload="none"` دارد. |
| `assets/platform/` | نمونه‌خروجی‌های واقعی نکس‌گپ از استایل‌های آماده nexgap.ai برای تب‌های پلتفرم: سه تصویر (`image-*.webp`) و یک ویدیو (`video-watch.mp4`، ۶۴۰×۳۶۰، بدون صدا، حدود ۲۸۰KB، با پوستر). ویدیو فقط وقتی تب «تولید ویدیو» باز است پخش می‌شود. |
| `preview-single-file.html` | نسخه تک‌فایلی فقط برای دیدن. در سایت منتشر نشود. |

## اتصال در وردپرس (قالب Atiehertebat-WP)
1. یک page template بسازید (مثلاً `page-templates/ai-nexgap.php`) و محتوای `.nx-page` را در آن بگذارید.
2. فقط در همین صفحه enqueue کنید:
   ```php
   if ( is_page_template('page-templates/ai-nexgap.php') ) {
     wp_enqueue_style('nx-page', get_theme_file_uri('assets/css/nexgap.css'), [], '1.0');
     wp_enqueue_script('nx-page', get_theme_file_uri('assets/js/nexgap.js'), [], '1.0', true);
   }
   ```
3. **فرم مشاوره**: نام فیلدها و hiddenها دقیقاً همان فرم فعلی `.home-consult` است (`action=atieh_consult`، `consult_name`، `consult_phone`، `consult_message`، honeypot با نام `atieh_hp`، `atieh_source`). فقط مقدار nonce را با PHP چاپ کنید:
   ```php
   <?php wp_nonce_field('atieh_consult', 'atieh_consult_nonce', false); ?>
   ```
   اگر اسکریپت فعلی سایت با `data-at-consult` ارسال را AJAX می‌کند، همین attribute را هم روی `<form>` بگذارید تا وضعیت ارسال در `.nx-form__status` نمایش داده شود.
4. **مشتریان**: لوگوها از `wp-content/uploads/2026/11/` خوانده می‌شوند. اگر partial فعلی `home-clients` را ترجیح می‌دهید، می‌توانید آن را جایگزین بخش ۹ کنید.
5. **Lazyload**: سایت از lazysizes استفاده می‌کند. در صورت تمایل برای `<img>`های مشتریان، `class="lazyload"` و `data-src` بگذارید.

## تم نکس‌گپ داخل صفحه
- قاب صفحه (تیترها، دکمه‌ها، پنل‌های تیره، فرم) با رنگ سبزآبی آتیه ارتباط باقی مانده است.
- بخش‌هایی که خود محصول را نشان می‌دهند کلاس `.nx-ng` دارند: نمای اپ و مسکات در هیرو، کارت مسیر «پلتفرم نکس‌گپ»، تب‌های پلتفرم و کارت ثبت‌نام. در این بخش‌ها رنگ‌ها به پالت سایت نکس‌گپ تغییر می‌کنند: `#5B4FE5`، لاوندر، کهربایی و گرادیان `209deg` هیروی nexgap.ai.
- فونت Vazirmatn فقط داخل ماکاپ‌های محصول استفاده شده است. اگر روی سایت لود نمی‌شود، روی Kalameh برمی‌گردد.
- مسکات `fetchpriority="high"` دارد، چون در دید اول قرار می‌گیرد. lazyload نکنید.

## باکس «از کجا شروع کنیم؟»
- پس‌زمینه همان تصویر باکس مشاوره صفحه `/services/software/` است، با همان لایه تیره ۶۰٪. در کد به فایل‌های موجود قالب (`assets/images/software/consult-bg*.webp`) لینک شده و فایل جدیدی لازم نیست. پوشه `assets/preview/` فقط برای پیش‌نمایش است و منتقل نشود.

## نکات
- اعداد فارسی، RTL و جهت فلش‌ها همه در خود CSS حل شده است. اسم مدل‌ها و کد با `.nx-ltr` ایزوله شده‌اند.
- بلوک کد API در بخش سازمانی **نمایشی** است. endpoint واقعی را از مستندات نکس‌گپ جایگزین کنید.
- لینک‌ها: پلن‌ها → `https://nexgap.ai/`، استودیو → `https://nexgap.ai/studio`. اگر صفحه پلن آدرس جدا دارد، عوضش کنید.
- `prefers-reduced-motion` رعایت شده است: انیمیشن‌ها و پخش خودکار استپر در این حالت خاموش می‌شوند.
- تب‌ها با کیبورد کار می‌کنند (فلش‌ها، Home و End). استپر استودیو با hover یا focus متوقف می‌شود و بعد از اولین کلیک کاربر دیگر خودکار جلو نمی‌رود.
- breakpointها همان breakpointهای قالب است: 1199.98 / 991.98 / 767.98.

## SEO
- `<title>` و `meta description` پیشنهادی در `<head>` فایل `index.html` آمده است و در Yoast یا Rank Math تنظیم شود.
- پیشنهاد می‌شود اسکیمای `FAQPage` را برای ۶ سوال متداول اضافه کنید.
