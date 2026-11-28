window.EstateThaiAddress = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fields = [
    ['subdistrict','ตำบล / แขวง',80],['district','อำเภอ / เขต',80],
    ['province','จังหวัด',80],['postalCode','รหัสไปรษณีย์',5],
  ];
  const searchStates = new WeakMap();
  const dataUrl = new URL('assets/geo/th-address-2026.10.23.json',document.currentScript.src);
  let dataRequest;

  function render(id,address={}) {
    return '<fieldset class="thai-address" data-thai-address><legend>ที่อยู่ในประเทศไทย</legend>' +
      '<label>ค้นหาตำบล แขวง หรือรหัสไปรษณีย์<input type="search" data-address-query role="combobox" ' +
      'aria-autocomplete="list" aria-expanded="false" aria-controls="'+id+'-options" aria-describedby="'+id+'-feedback" ' +
      'autocomplete="off" placeholder="เช่น ปากเกร็ด หรือ 11120"></label>' +
      '<ul class="address-options" id="'+id+'-options" role="listbox" aria-label="พื้นที่ที่ตรงกับคำค้น" hidden></ul>' +
      '<p class="v2-deal-hint" id="'+id+'-feedback" data-address-feedback role="status">เลือกจากผลค้นหา หรือกรอกเองได้</p>' +
      '<div class="form-grid">' + fields.map(([key,label,length]) =>
        '<label>'+label+'<input name="'+key+'" maxlength="'+length+'" data-address-field value="'+escape(address[key])+'"'+
        (key==='postalCode' ? ' inputmode="numeric" pattern="[0-9]{5}" title="กรอกรหัสไปรษณีย์ 5 หลัก"' : '')+'></label>').join('') +
      '</div><input type="hidden" name="subdistrictCode" value="'+escape(address.subdistrictCode)+'">' +
      '<small class="address-source">ข้อมูลพื้นที่ <a href="https://github.com/GeoThai/data/releases/tag/v2026.10.23" target="_blank" rel="noopener noreferrer">GeoThai</a> · CC BY 4.0</small></fieldset>';
  }

  function read(form) {
    return Object.fromEntries([...fields.map(([key])=>key),'subdistrictCode'].map(key=>
      [key,form.elements[key].value.trim()]));
  }

  const normalize = value => value.normalize('NFC').trim().toLocaleLowerCase('th')
    .replace(/[๐-๙]/g,digit=>String(digit.charCodeAt(0)-0x0e50));

  function load() {
    if (!dataRequest) dataRequest = fetch(dataUrl).then(response=>{
      if (!response.ok) throw new Error('Address dataset unavailable');
      return response.json();
    }).catch(error=>{dataRequest=undefined;throw error;});
    return dataRequest;
  }

  function clear(input) {
    const panel = document.getElementById(input.getAttribute('aria-controls'));
    panel.replaceChildren();
    panel.hidden = true;
    input.setAttribute('aria-expanded','false');
    input.removeAttribute('aria-activedescendant');
    searchStates.delete(input);
  }

  async function suggest(input) {
    clear(input);
    const query = normalize(input.value).replace(/^(ต\.|แขวง\s*|ตำบล\s*)/,'').trim();
    const postal = /^\d+$/.test(query);
    const feedback = document.getElementById(input.getAttribute('aria-describedby'));
    if (query.length < (postal ? 3 : 2)) {
      feedback.textContent = 'พิมพ์อย่างน้อย 2 ตัวอักษร หรือรหัสไปรษณีย์ 3 หลักขึ้นไป';
      return;
    }
    const request = {matches:[],active:-1};
    searchStates.set(input,request);
    feedback.textContent = 'กำลังโหลดข้อมูลพื้นที่…';
    try {
      const data = await load();
      if (!input.isConnected || searchStates.get(input)!==request) return;
      for (const [code,subdistrict,district,province,postcodes] of data) {
        const matchingCodes = postal ? postcodes.filter(zip=>zip.startsWith(query)) :
          normalize(subdistrict).includes(query) ? (postcodes.length ? postcodes : ['']) : [];
        for (const postalCode of matchingCodes) request.matches.push({code,subdistrict,district,province,postalCode});
        if (request.matches.length>12) break;
      }
      const limited = request.matches.length>12;
      request.matches = request.matches.slice(0,12);
      const panel = document.getElementById(input.getAttribute('aria-controls'));
      request.matches.forEach((row,index)=>{
        const option = document.createElement('li');
        option.id = panel.id+'-'+index;
        option.setAttribute('role','option');
        option.setAttribute('aria-selected','false');
        option.dataset.addressChoice = index;
        const bangkok = row.code.startsWith('10');
        option.textContent = (bangkok ? 'แขวง':'ต.') + row.subdistrict+' · '+(bangkok ? 'เขต':'อ.')+row.district+
          ' · '+row.province+(row.postalCode ? ' · '+row.postalCode : '');
        panel.append(option);
      });
      panel.hidden = !request.matches.length;
      input.setAttribute('aria-expanded',String(!panel.hidden));
      feedback.textContent = request.matches.length ?
        (limited ? 'แสดง 12 ตัวเลือกแรก ลองพิมพ์เพิ่มเพื่อกรอง' : 'เลือกพื้นที่จากรายการ') :
        'ไม่พบพื้นที่ที่ตรงกัน กรอกเองได้';
    } catch {
      if (searchStates.get(input)===request) feedback.textContent = 'โหลดข้อมูลพื้นที่ไม่ได้ กรอกเองหรือลองค้นอีกครั้ง';
    }
  }

  function apply(input,index) {
    const row = searchStates.get(input)?.matches[index];
    if (!row) return;
    for (const [key] of fields) input.form.elements[key].value = row[key];
    input.form.elements.subdistrictCode.value = row.code;
    input.value = '';
    clear(input);
    document.getElementById(input.getAttribute('aria-describedby')).textContent = 'เติมที่อยู่แล้ว ตรวจสอบหรือแก้ไขได้';
    input.focus();
  }

  document.addEventListener('input',event=>{
    const input = event.target;
    if (input.matches('[data-address-field]')) input.form.elements.subdistrictCode.value = '';
    if (input.matches('[data-address-query]') && !event.isComposing) void suggest(input);
  });
  document.addEventListener('compositionend',event=>{
    if(event.target.matches('[data-address-query]')) void suggest(event.target);
  });
  document.addEventListener('pointerdown',event=>{
    const option = event.target.closest('[data-address-choice]');
    if (option) event.preventDefault();
    for (const input of document.querySelectorAll('[data-address-query]')) {
      if (!input.closest('[data-thai-address]').contains(event.target) && searchStates.has(input)) clear(input);
    }
  });
  document.addEventListener('click',event=>{
    const option = event.target.closest('[data-address-choice]');
    if (option) apply(option.closest('[data-thai-address]').querySelector('[data-address-query]'),Number(option.dataset.addressChoice));
  });
  document.addEventListener('keydown',event=>{
    const input = event.target;
    if (!input.matches('[data-address-query]') || event.isComposing) return;
    const state = searchStates.get(input);
    if (event.key==='Tab') { clear(input); return; }
    if (event.key==='Enter') {
      event.preventDefault();
      if (state?.active>=0) apply(input,state.active);
      else if (state?.matches.length===1) apply(input,0);
      else if (!state && input.value) void suggest(input);
      return;
    }
    if (event.key==='Escape' && state) {
      event.preventDefault();
      clear(input);
      return;
    }
    if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
    if (!state?.matches.length) {
      if (input.value) { event.preventDefault(); void suggest(input); }
      return;
    }
    event.preventDefault();
    const panel = document.getElementById(input.getAttribute('aria-controls'));
    if (state.active>=0) panel.children[state.active].setAttribute('aria-selected','false');
    const count = state.matches.length;
    state.active = event.key==='ArrowDown' ? (state.active+1)%count : (state.active<0 ? count-1 : (state.active-1+count)%count);
    const next = panel.children[state.active];
    next.setAttribute('aria-selected','true');
    input.setAttribute('aria-activedescendant',next.id);
    next.scrollIntoView({block:'nearest'});
  });
  return {render,read};
})();
