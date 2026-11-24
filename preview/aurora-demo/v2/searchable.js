window.EstateSearchable = (() => {
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clean = value => value.normalize('NFC').toLocaleLowerCase('th');

  function render({id,options,multiple=false,selected=[],label,placeholder,empty='ไม่พบรายการที่ตรงกับคำค้น',summary='ทุกสถานะ'}) {
    const search = '<input type="search" class="picker-search" aria-label="'+escape(placeholder)+'" placeholder="'+escape(placeholder)+'"'+
      (multiple ? '' : ' role="combobox" aria-expanded="true" aria-controls="'+id+'-options" aria-autocomplete="list" autofocus')+'>';
    const chips = multiple ? '<div class="picker-chips" aria-label="ตัวกรองที่เลือก">'+
      options.filter(option=>selected.includes(option.value)).map(option=>'<button type="button" class="picker-chip" data-picker-remove="'+
        escape(option.value)+'" aria-label="ลบตัวกรอง '+escape(option.label)+'">'+escape(option.label)+' ×</button>').join('')+'</div>' : '';
    const groups = [...new Set(options.map(option=>option.group))];
    const rows = groups.map(group=>'<div class="picker-group"'+(multiple ? '':' role="group"'+(group?' aria-label="'+escape(group)+'"':''))+'>'+
      (group ? '<p class="picker-group-title"'+(multiple?'':' aria-hidden="true"')+'>'+escape(group)+'</p>':'')+
      options.filter(option=>option.group===group).map((option,index)=>{
        const text = escape(option.label);
        return multiple ?
          '<label class="picker-row"><input type="checkbox" name="'+id+'" value="'+escape(option.value)+'"'+
            (selected.includes(option.value)?' checked':'')+(option.disabled?' disabled':'')+'><span>'+text+'</span></label>' :
          '<div class="picker-row" role="option" aria-selected="false"'+(option.disabled?' aria-disabled="true"':'')+
            ' id="'+id+'-option-'+groups.indexOf(group)+'-'+index+'" data-v2="'+escape(option.value)+'"><span>'+text+'</span></div>';
      }).join('')+'</div>').join('');
    const panel = '<div class="picker-panel">'+search+chips+'<div class="picker-options" id="'+id+'-options"'+
      (multiple?' role="group"':' role="listbox"')+' aria-label="'+escape(label)+'">'+rows+'</div>'+
      '<p class="picker-empty" role="status"'+(options.length?' hidden':'')+'>'+escape(empty)+'</p></div>';
    return multiple ? '<details class="picker picker-multiple" data-summary="'+escape(summary)+'"><summary aria-label="'+escape(label)+'">'+
      '<span>'+escape(selected.length ? 'สถานะ · '+selected.length : summary)+'</span></summary>'+panel+'</details>' :
      '<div class="picker picker-single">'+panel+'</div>';
  }

  function highlight(node, query) {
    const label = node.textContent;
    const index = query ? clean(label).indexOf(query) : -1;
    if(index < 0) return;
    const mark = document.createElement('mark');
    mark.textContent = label.slice(index,index+query.length);
    node.replaceChildren(label.slice(0,index),mark,label.slice(index+query.length));
  }

  function activate(input,option,scroll=false) {
    const old = input.getAttribute('aria-activedescendant');
    if(old) input.closest('.picker').querySelector('[id="'+old+'"]')?.setAttribute('aria-selected','false');
    if(!option) { input.removeAttribute('aria-activedescendant'); return; }
    option.setAttribute('aria-selected','true');
    input.setAttribute('aria-activedescendant',option.id);
    if(scroll) option.scrollIntoView({block:'nearest'});
  }

  function filter(input) {
    const picker = input.closest('.picker');
    const query = clean(input.value.trim());
    activate(input,null);
    let matches = 0;
    for(const group of picker.querySelectorAll('.picker-group')) {
      let count = 0;
      for(const row of group.querySelectorAll('.picker-row')) {
        const label = row.querySelector('span');
        label.textContent = label.textContent;
        row.hidden = !clean(label.textContent).includes(query);
        if(!row.hidden) { count++; highlight(label,query); }
      }
      group.hidden = !count;
      matches+=count;
    }
    picker.querySelector('.picker-empty').hidden=matches>0;
  }

  function sync(picker) {
    const checked = [...picker.querySelectorAll('input:checked')];
    picker.querySelector('summary span').textContent = checked.length ? 'สถานะ · '+checked.length : picker.dataset.summary;
    const chips = picker.querySelector('.picker-chips');
    chips.replaceChildren(...checked.map(input=>{
      const button = document.createElement('button');
      button.type='button';
      button.className='picker-chip';
      button.dataset.pickerRemove=input.value;
      const label=input.closest('label').querySelector('span').textContent;
      button.textContent=label+' ×';
      button.setAttribute('aria-label','ลบตัวกรอง '+label);
      return button;
    }));
  }

  document.addEventListener('input',event=>{
    if(event.target.matches('.picker-search')) filter(event.target);
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('.picker-multiple input[type=checkbox]')) sync(event.target.closest('.picker'));
  });
  document.addEventListener('toggle',event=>{
    const picker=event.target;
    if(!picker.matches?.('.picker-multiple')) return;
    const input=picker.querySelector('.picker-search');
    if(picker.open) {sync(picker);input.focus({preventScroll:true});}
    else {input.value='';filter(input);}
  },true);
  document.addEventListener('pointerdown',event=>{
    for(const picker of document.querySelectorAll('.picker-multiple[open]')) if(!picker.contains(event.target)) picker.open=false;
  });
  document.addEventListener('click',event=>{
    const chip=event.target.closest('[data-picker-remove]');
    if(!chip) return;
    const picker=chip.closest('.picker');
    [...picker.querySelectorAll('input:checked')].find(input=>input.value===chip.dataset.pickerRemove)?.click();
    picker.querySelector('.picker-search').focus({preventScroll:true});
  });
  document.addEventListener('pointermove',event=>{
    const row=event.target.closest('.picker-single [role=option]:not([aria-disabled=true])');
    if(row && event.pointerType==='mouse') activate(row.closest('.picker').querySelector('input'),row);
  });
  document.addEventListener('keydown',event=>{
    const picker=event.target.closest('.picker');
    if(!picker || event.isComposing) return;
    if(event.key==='Tab' && picker.open) requestAnimationFrame(()=>{
      if(!picker.contains(document.activeElement)) picker.open=false;
    });
    if(event.key==='Escape' && picker.open) {
      event.preventDefault();event.stopPropagation();
      picker.open=false;picker.querySelector('summary').focus();return;
    }
    if(!event.target.matches('[role=combobox]')) return;
    const input=event.target;
    const rows=[...picker.querySelectorAll('[role=option]:not([hidden]):not([aria-disabled=true])')];
    const current=rows.findIndex(row=>row.id===input.getAttribute('aria-activedescendant'));
    const last=rows.length-1;
    const keys={ArrowDown:current>=last?0:current+1,ArrowUp:current<=0?last:current-1,
      PageDown:Math.min(current+8,last),PageUp:Math.max(current-8,0)};
    if(event.key==='Enter' && current>=0) {event.preventDefault();rows[current].click();return;}
    if(Object.hasOwn(keys,event.key)&&rows.length) {event.preventDefault();activate(input,rows[keys[event.key]],true);}
  });
  return {render};
})();
