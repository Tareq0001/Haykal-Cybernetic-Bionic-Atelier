# هَـيْـكَل | معمل الأطراف السيبرانية الحركية والهياكل الحيوية ثلاثية الأبعاد
### HAYKAL | Cybernetic Bionic Prosthetics & Exoskeleton 3D Atelier

> **المصمم المعماري للأنظمة وصاحب المشروع:** أ. طارق ابوعشي (Tareq Abuashi)  
> **الرابط المباشر للمنصة الحية:** [https://tareq0001.github.io/Haykal-Cybernetic-Bionic-Atelier/](https://tareq0001.github.io/Haykal-Cybernetic-Bionic-Atelier/)

---

## 🦾 نظرة عامة على المشروع (Overview)
منصة تفاعلية هندسية ثلاثية الأبعاد عالية الدقة لمحاكاة الأطراف واليد السيبرانية البيوميكانيكية الذكية (Cybernetic Bionic Hand MK-IX). توفر المنصة محاكاة فيزيائية وحركية متزامنة (Inverse Kinematics)، وفك شفرات الإشارات العضلية السطحية (Surface EMG Neural Decoder)، وخرائط الضغط اللمسي للأطراف، مع محرك صوتي هيدروليكي للمحركات الدقيقة (Servo Micro-Acoustics) معتمد بالكامل على Web Audio API.

---

## ✨ أبرز المزايا والقدرات التقنية (Key Features)

1. **الهيكل الحركي ثلاثي الأبعاد (Articulated 3D Prosthetic Hand):**
   - يد وروبوت سيبراني متكامل يحتوي على أكثر من 15 مفصل سلامي مستقل (Metacarpals, PIP, DIP) لجميع الأصابع الخمسة بالإضافة إلى محاور حركة المعصم (Wrist Gimbal: Pitch & Yaw).
   - تحكم كامل بالانثناء الانفرادي لكل إصبع من 0% إلى 100%.
   - أوضاع قبضة برمجية مسبقة عبر حركات GSAP الانسيابية:
     - **Power Fist:** عزم القبضة الكاملة للأحمال العالية.
     - **Precision Pinch:** التقاط دقيق للأجسام الصغيرة بملاقاة الإبهام والسبابة.
     - **Point / Interface:** تمديد السبابة للتفاعل مع الشاشات اللمسية.
     - **Hook Grip:** قبضة الخطاف لحمل الحقائب والمقابض.
     - **Peace / Cyber Neutral:** الوضعية الحيادية وإشارة النصر.
     - **Full Extension:** الانبساط التام واسترخاء السلاميات.
   - 4 خامات وهياكل تصنيعية فضائية:
     - ألياف الكربون المقواة (Forged Carbon Fiber)
     - تيتانيوم الطيران من الدرجة الخامسة (Aerospace Grade 5 Titanium)
     - المؤكسد السيبراني البنفسجي والذهبي (Cyber Anodized Purple/Gold)
     - السبج التكتيكي غير اللامع (Stealth Matte Obsidian)
   - ميزة التفكيك وفحص الهيكل الداخلي (Explode Chassis View) لكشف أسطوانات ومحركات السيرفو الداخلية.
   - نمط الهولوجرام والأشعة السينية (X-Ray Wireframe Mode).

2. **محرك الإشارات العضلية الحيوية (Surface EMG Neural Telemetry):**
   - محاكاة حية متعددة القنوات (CH1: Flexor Digitorum, CH2: Extensor Digitorum, CH3: Abductor Pollicis).
   - عرض السعة الحية (µV)، التردد الوسيط (Hz)، ونسبة الإشارة للضجيج (SNR dB).
   - إمكانية إطلاق نبضة جهد عالي لاختبار استجابة المحركات وسرعتها.

3. **مصفوفة الضغط اللمسي للأطراف (Tactile Sensory Matrix):**
   - قياس عزم الضغط بالنيوتن (Newtons) على أطراف الأصابع الخمسة مع مؤشرات لونية متدرجة وتحديث بصري لإضاءة حساسات السيليكون في نموذج الـ 3D.

4. **محاكي إدارة خلايا الطاقة (Bionic Battery & Power Management):**
   - سحب تيار ديناميكي (Amperes) ودرجة حرارة النواة التشغيلية، مع 3 أنماط طاقة: المتزن (Balanced)، عزم فائق (High Torque)، وتوفير الطاقة (Eco).

5. **المحرك الصوتي للسيرفو (Web Audio API Servo Engine):**
   - توليد تركيبي متزامن لصوت دوران السيرفو الحقيقي (High-pitch whine)، ونقر الإغلاق الميكانيكي دون أي ملفات صوتية خارجية.

6. **ملف المعايرة السريرية والوثيقة الطبية (Patient Prescription Dossier):**
   - استخراج تقرير المعايرة الطبية الحيوية للمريض متضمن التوقيع الرسمي لرئيس الفريق: **أ. طارق ابوعشي** وختم الاعتماد مع ميزة الطباعة الرسمية (`window.print()`) واحتفالية الإنجاز (`canvas-confetti`).

7. **دعم ثنائي اللغة ومظاهر متعددة (Bilingual i18n & Dual Theme):**
   - تبديل فوري بين العربية (الافتراضية) والإنجليزية مع اتجاه تلقائي RTL/LTR.
   - مظهر السبراني الليلي (Cyber Dark Obsidian) والمظهر الإكلينيكي النهاري (Clinical Titanium).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **Three.js (WebGL 3D Engine)**
- **GSAP (GreenSock Animation Platform)**
- **TypeScript & Vite**
- **Web Audio API**
- **Canvas-Confetti**

---

© 2026 هَـيْـكَل (HAYKAL) — ابتكار وتطوير: **أ. طارق ابوعشي**
