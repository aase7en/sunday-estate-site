window.EstateMedia = (() => {
  const accept = 'image/jpeg,image/png,image/webp';
  const maxBytes = 8_000_000;
  const encodingProbe = document.createElement('canvas');
  encodingProbe.width = encodingProbe.height = 1;
  const encodesWebp = encodingProbe.toDataURL('image/webp').startsWith('data:image/webp');
  const rules = {
    story: {ratio:'16:9', width:1920, height:1080, minimum:960, budget:420_000},
    storyMobile: {ratio:'9:16', width:900, height:1600, minimum:540, budget:360_000},
    opening: {ratio:'3:2', width:1536, height:1024, minimum:960, budget:420_000},
    openingMobile: {ratio:'4:5', width:800, height:1000, minimum:560, budget:320_000},
    mist: {ratio:'2:1', width:1100, height:550, minimum:720, budget:240_000},
    header: {ratio:'3:1', width:1920, height:640, minimum:960, budget:300_000},
    headerMobile: {ratio:'2:1', width:960, height:480, minimum:600, budget:200_000},
    sidebar: {ratio:'4:5', width:600, height:750, minimum:360, budget:140_000},
    brand: {ratio:'1:1', width:512, height:512, minimum:128, budget:120_000},
    favicon: {ratio:'1:1', width:64, height:64, minimum:32, budget:24_000},
    cover: {ratio:'3:1', width:1440, height:480, minimum:720, budget:240_000},
    avatar: {ratio:'1:1', width:320, height:320, minimum:96, budget:80_000},
    gallery: {ratio:'4:5', width:800, height:1000, minimum:400, budget:78_000},
    listing: {ratio:'2:1', width:1440, height:720, minimum:640, budget:120_000},
  };
  const slot = (key, label, fallback, spec, note = '') => ({key,label,fallback,spec,note});
  const paired = (key, label, desktop, mobile, wideSpec, phoneSpec, note = '') => [
    slot(key,label+' · เดสก์ท็อป',desktop,wideSpec,note),
    slot(key+'-mobile',label+' · มือถือ',mobile,phoneSpec,note),
  ];
  const chapterSlots = [
    ['business','ฉาก 2 · ธุรกิจ','business-828'],
    ['land','ฉาก 3 · ที่ดิน','land'],
    ['retirement','ฉาก 4 · วัยเกษียณ','retirement-828'],
    ['family','ฉาก 5 · ครอบครัว','family-828'],
  ].flatMap(([key,label,mobile])=>paired('chapter-'+key,label,'assets/scenes/'+key+'.webp',
    'assets/scenes/'+mobile+'.webp','story','storyMobile','เผื่อพื้นที่ด้านล่างไว้สำหรับข้อความ'));
  const headerSlots = [
    ['overview','ภาพรวม'], ['lending','ปล่อยกู้ / ขายฝาก'], ['investments','ลงทุนที่ดิน'],
    ['contracts','สัญญาของฉัน'], ['reconciliation','กระทบยอด'],
    ['personal-home','พื้นที่ของฉัน','overview'], ['personal-lending','ปล่อยกู้ส่วนตัว','lending'],
  ].flatMap(([key,label,asset=key])=>paired('header-'+key,label,'assets/mastheads/'+asset+'.webp',
    'assets/mastheads/'+asset+'-mobile.webp','header','headerMobile','วางจุดสนใจด้านขวา เว้นด้านซ้ายสำหรับข้อความ'));
  const officialLogo = 'assets/brand/sunday-logo-mark.png';
  const groups = [
    {id:'chapters',label:'Hero ฉาก 2–5',slots:chapterSlots},
    {id:'opening',label:'Hero ฉากเปิด',slots:[
      ...paired('intro','ฉาก 1 · บ้าน', 'assets/scenes/opening-dawn.webp','assets/scenes/opening-dawn-mobile.webp',
        'opening','openingMobile','วางตัวบ้านช่วงกลางภาพ ภาพใหม่ใช้ชั้นบังแนวนอนเพื่อให้ข้อความลอยขึ้นได้'),
      slot('intro-sky','ท้องฟ้าขณะเผยชื่อบริษัท','assets/scenes/opening-sky.webp','opening'),
      slot('intro-mist','ชั้นเมฆหมอก','assets/scenes/opening-mist.webp','mist','ใช้ PNG หรือ WebP ที่มีพื้นโปร่งใส'),
    ]},
    {id:'headers',label:'ภาพหัวหน้าโมดูล',slots:headerSlots},
    {id:'site',label:'แบรนด์และภาพค่าเริ่มต้น',slots:[
      slot('brand','โลโก้บริษัท',officialLogo,'brand','ใช้กับเมนู หน้าเข้าสู่ระบบ และฉากเผยโลโก้'),
      slot('favicon','ไอคอนแท็บเบราว์เซอร์',officialLogo,'favicon'),
      slot('sidebar','ภาพด้านข้างแดชบอร์ด','assets/scenes/land.webp','sidebar'),
      slot('profile-cover','ภาพปกโปรไฟล์ค่าเริ่มต้น','assets/aurora-estate.webp','cover','บัญชีที่ตั้งภาพปกเองจะแสดงภาพของบัญชีนั้น'),
    ]},
  ];
  const slots = new Map(groups.flatMap(group=>group.slots.map(item=>[item.key,item])));
  const custom = new Map();
  const openStore = new Promise((resolve,reject)=>{
    const request = indexedDB.open('sunday-estate-aurora-media',1);
    request.onupgradeneeded = ()=>request.result.createObjectStore('images',{keyPath:'key'});
    request.onsuccess = ()=>resolve(request.result);
    request.onerror = ()=>reject(request.error);
    request.onblocked = ()=>reject(new Error('ปิดแท็บเดโมอื่นแล้วลองอีกครั้ง'));
  });

  function requestStore(mode, operation) {
    return openStore.then(db=>new Promise((resolve,reject)=>{
      const transaction = db.transaction('images',mode);
      const request = operation(transaction.objectStore('images'));
      transaction.oncomplete = ()=>resolve(request.result);
      transaction.onabort = ()=>reject(transaction.error);
    }));
  }
  function apply(key, row) {
    if (custom.has(key)) URL.revokeObjectURL(custom.get(key).src);
    if (row) {
      const {width,height,bytes,mime} = row;
      custom.set(key,{width,height,src:URL.createObjectURL(new Blob([bytes],{type:mime}))});
    }
    else custom.delete(key);
  }
  const ready = requestStore('readonly',store=>store.getAll())
    .then(rows=>rows.filter(row=>slots.has(row.key)&&row.bytes instanceof ArrayBuffer).forEach(row=>apply(row.key,row)))
    .catch(()=>{});
  const source = key => custom.get(key)?.src ?? slots.get(key).fallback;
  const has = key => custom.has(key);
  const kb = bytes => Math.ceil(bytes/1000)+' KB';
  const guide = key => {
    const {ratio,width,height,minimum,budget} = rules[key];
    return 'JPEG, PNG หรือ WebP · สัดส่วน '+ratio+' · แนะนำ '+width+' × '+height+' px · ขั้นต่ำหลังตัดกึ่งกลาง '+minimum+' × '+
      Math.round(minimum*height/width)+' px · ไฟล์ต้นฉบับสูงสุด 8 MB · หลังปรับไม่เกิน '+kb(budget);
  };
  function toDataUrl(blob) {
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>resolve(reader.result);
      reader.onerror = ()=>reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function prepare(file,key) {
    const spec = rules[key];
    if (!file || !file.size || file.size > maxBytes || !accept.split(',').includes(file.type)) {
      throw new Error('เลือกไฟล์ JPEG, PNG หรือ WebP ขนาดไม่เกิน 8 MB');
    }
    let image;
    try { image = await createImageBitmap(file); }
    catch { throw new Error('เปิดไฟล์รูปนี้ไม่ได้ กรุณาเลือกรูปใหม่'); }
    try {
      if (image.width > 8192 || image.height > 8192 || image.width*image.height > 32_000_000) {
        throw new Error('ภาพมีพิกเซลมากเกินไป ใช้ภาพไม่เกิน 8,192 px ต่อด้านและไม่เกิน 32 ล้านพิกเซล');
      }
      const ratio = spec.width/spec.height;
      const cropWidth = Math.min(image.width,image.height*ratio);
      const cropHeight = cropWidth/ratio;
      if (cropWidth < spec.minimum) {
        throw new Error('ภาพเล็กเกินไปหลังตัดตามสัดส่วน ต้องมีอย่างน้อย '+spec.minimum+' × '+
          Math.round(spec.minimum/ratio)+' px');
      }
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const preserveAlpha = ['mist','brand','avatar'].includes(key);
      const format = key === 'favicon' ? 'image/png' : encodesWebp ? 'image/webp' : preserveAlpha ? 'image/png' : 'image/jpeg';
      let width = Math.round(Math.min(cropWidth,spec.width));
      while (true) {
        canvas.width = width;
        canvas.height = Math.round(width/ratio);
        context.imageSmoothingQuality = 'high';
        context.drawImage(image,(image.width-cropWidth)/2,(image.height-cropHeight)/2,cropWidth,cropHeight,
          0,0,canvas.width,canvas.height);
        for (const quality of [.86,.74,.6]) {
          const blob = await new Promise(resolve=>canvas.toBlob(resolve,format,quality));
          if (blob?.size <= spec.budget) return {blob,width:canvas.width,height:canvas.height};
          if (blob?.type === 'image/png') break;
        }
        if (width === spec.minimum) break;
        width = Math.max(spec.minimum,Math.floor(width*.82));
      }
      throw new Error('บีบอัดภาพให้เหลือ '+kb(spec.budget)+' ไม่ได้ กรุณาใช้รูปที่มีรายละเอียดน้อยลง');
    } finally { image.close(); }
  }

  function editor({isAdmin,isPage,showDialog,dialog,escape,icon,notice,render}) {
    function page() {
      if (!isAdmin()) return '';
      return '<header class="profile-intro media-intro"><div><h1>จัดการรูปภาพ</h1>'+
        '<p>เลือกตำแหน่งเพื่อเปลี่ยนภาพทีละส่วน รูปที่บันทึกในเดโมจะแสดงในเบราว์เซอร์นี้</p></div>'+
        '<a class="control" href="#hero">ดูหน้าแรก '+icon('arrow',16)+'</a></header>'+
        '<section class="card panel media-collections" aria-label="ภาพตามรายการ">'+
        '<button class="control" type="button" data-v2="gallery">'+icon('image',17)+' แกลเลอรี</button>'+
        '<button class="control" type="button" data-v2="listings">'+icon('home',17)+' ภาพปกทรัพย์</button></section>'+
        groups.map(({id,label,slots:items})=>'<details class="card media-group" data-media-group="'+id+'"'+
          (id==='chapters'?' open':'')+'><summary><span>'+label+'</span>'+icon('chevron',16)+'</summary><div class="media-grid">'+
          items.map(item=>{
            const saved = custom.get(item.key);
            const {width,height} = saved ?? rules[item.spec];
            return '<article class="media-tile"><img src="'+source(item.key)+'" alt="" loading="lazy" decoding="async">'+
              '<div class="media-tile-copy"><h3>'+item.label+'</h3><p>'+(saved?'ภาพที่บันทึก':'ขนาดแนะนำ')+' '+width+' × '+height+
              ' px</p><button id="edit-'+item.key+'" class="control" type="button" data-media-edit="'+item.key+
              '" aria-label="เปลี่ยนภาพ '+item.label+'">เปลี่ยนภาพ</button></div></article>';
          })
            .join('')+'</div></details>').join('');
    }

    function edit(key) {
      const item = slots.get(key);
      if (!isAdmin() || !isPage() || !item) return;
      const spec = rules[item.spec];
      showDialog(item.label,'<form id="site-media-form" class="editor">'+
        '<div class="media-preview" style="--media-ratio:'+spec.width/spec.height+'"><img src="'+source(key)+'" alt="ภาพที่กำลังใช้"></div>'+
        '<p class="muted" id="media-guide">'+guide(item.spec)+(item.note?' · '+item.note:'')+'</p>'+
        '<label>เลือกรูปจากอุปกรณ์<input type="file" accept="'+accept+'" name="image" aria-describedby="media-guide" required></label>'+
        '<p class="muted" role="status" data-media-status>เลือกไฟล์เพื่อดูภาพที่ตัดและบีบอัดก่อนบันทึก</p>'+
        '<p class="risk-text" role="alert" data-media-error></p>'+
        '<div class="form-footer">'+(has(key)?'<button class="control" type="button" data-media-reset>คืนภาพเริ่มต้น</button>':'')+
        '<button class="primary" type="submit" disabled>บันทึกภาพตำแหน่งนี้</button></div></form>','site-media');
      const form = dialog.querySelector('#site-media-form');
      const input = form.elements.image;
      const preview = form.querySelector('img');
      const status = form.querySelector('[data-media-status]');
      const error = form.querySelector('[data-media-error]');
      const submit = form.querySelector('[type="submit"]');
      const reset = form.querySelector('[data-media-reset]');
      const active = ()=>form.isConnected && dialog.open && isAdmin() && isPage();
      let selected;
      let previewUrl;
      const clearPreview = ()=>{
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = undefined;
      };
      dialog.addEventListener('close',clearPreview,{once:true});
      input.addEventListener('change',async ()=>{
        const file = input.files[0];
        selected = undefined;
        submit.disabled = true;
        error.textContent = '';
        clearPreview();
        preview.src = source(key);
        preview.alt = 'ภาพที่กำลังใช้';
        status.textContent = file?'กำลังตัดและบีบอัดภาพ…':'เลือกไฟล์เพื่อดูภาพที่ตัดและบีบอัดก่อนบันทึก';
        if (!file) return;
        try {
          const prepared = await prepare(file,item.spec);
          if (!active() || input.files[0] !== file) return;
          selected = prepared;
          previewUrl = URL.createObjectURL(prepared.blob);
          preview.src = previewUrl;
          preview.alt = 'ภาพตัวอย่างหลังตัดและบีบอัด';
          status.textContent = prepared.width+' × '+prepared.height+' px · '+kb(prepared.blob.size)+' พร้อมบันทึก';
          submit.disabled = false;
        } catch (problem) {
          if (!active() || input.files[0] !== file) return;
          status.textContent = '';
          error.textContent = problem.message;
        }
      });

      async function save(row) {
        if (!active()) return;
        submit.disabled = true;
        input.disabled = true;
        if (reset) reset.disabled = true;
        error.textContent = '';
        try {
          // WebKit private contexts can reject storing Blob objects directly.
          const record = row && {key,width:row.width,height:row.height,bytes:await row.blob.arrayBuffer(),mime:row.blob.type};
          if (!active()) return;
          await requestStore('readwrite',store=>record?store.put(record):store.delete(key));
          apply(key,record);
          if (!active()) return;
          clearPreview();
          const expanded = [...document.querySelectorAll('[data-media-group][open]')].map(node=>node.dataset.mediaGroup);
          dialog.close();
          render();
          document.querySelectorAll('[data-media-group]').forEach(node=>{ node.open = expanded.includes(node.dataset.mediaGroup); });
          document.getElementById('edit-'+key)?.focus({preventScroll:true});
          notice(row?'บันทึกภาพตำแหน่งนี้แล้ว':'คืนภาพเริ่มต้นแล้ว');
        } catch {
          if (active()) error.textContent = 'เบราว์เซอร์บันทึกภาพไม่ได้ กรุณาตรวจพื้นที่จัดเก็บแล้วลองอีกครั้ง';
        } finally {
          input.disabled = false;
          if (reset) reset.disabled = false;
          submit.disabled = !selected;
        }
      }
      form.addEventListener('submit',event=>{
        event.preventDefault();
        event.stopPropagation();
        if (selected && !input.disabled) void save(selected);
      });
      reset?.addEventListener('click',()=>{ if (!input.disabled) void save(); });
    }
    return {page,edit};
  }
  return {ready,source,has,guide,accept,prepare,toDataUrl,editor};
})();
