window.EstateDashboardLayout = (() => {
  const labels = {
    cash:'กระแสเงินสด',
    composition:'สัดส่วนสถานะสัญญา',
    trend:'แนวโน้มพอร์ตสินเชื่อ',
    queue:'สัญญาที่ต้องติดตาม',
  };
  const original = Object.keys(labels);

  function normalize(saved) {
    const known = Array.isArray(saved) ? saved.filter(id => original.includes(id)) : [];
    return [...new Set([...known,...original])];
  }

  function create({root,dialog,icon,open,active,save}) {
    let draft = [];
    let press;
    let drag;

    const rows = () => draft.map((id,index) => {
      const move = (direction, disabled) => '<button type="button" class="layout-step" data-layout-move="' + direction +
        '" aria-label="ย้าย' + (direction < 0 ? 'ขึ้น' : 'ลง') + ' ' + labels[id] + '"' + (disabled ? ' disabled' : '') + '>' +
        icon(direction < 0 ? 'upArrow' : 'downArrow',16) + '</button>';
      return '<li class="layout-item" data-layout-id="' + id + '"><span class="layout-grip" data-layout-grip aria-hidden="true">' +
        icon('grip',18) + '</span><span class="layout-name">' + labels[id] + '</span>' + move(-1,index === 0) + move(1,index === draft.length - 1) + '</li>';
    }).join('');

    function openEditor(saved) {
      if (!active() || dialog.open) return;
      draft = normalize(saved);
      open('จัดหน้า Dashboard','<div class="layout-editor"><p>ลากจากหูจับ หรือใช้ลูกศรเพื่อย้ายการ์ดขึ้นลง</p>' +
        '<ol id="layout-order" class="layout-order" aria-label="ลำดับการ์ด">' + rows() + '</ol>' +
        '<p class="sr-only" role="status" id="layout-live"></p>' +
        '<div class="form-footer layout-footer"><button type="button" class="control" data-layout-reset>คืนค่าเริ่มต้น</button>' +
        '<button type="button" class="control" data-action="dismiss">ยกเลิก</button>' +
        '<button type="button" class="primary" data-layout-save>บันทึก</button></div></div>','layout');
    }

    function move(id,index) {
      const from = draft.indexOf(id);
      if (from < 0 || index < 0 || index >= draft.length || from === index) return;
      draft.splice(from,1);
      draft.splice(index,0,id);
      dialog.querySelector('#layout-order').innerHTML = rows();
      dialog.querySelector('#layout-live').textContent = labels[id] + ' อยู่ลำดับ ' + (index + 1);
    }

    dialog.addEventListener('click', event => {
      if (!dialog.open || dialog.dataset.kind !== 'layout' || !active()) return;
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-layout-save')) save([...draft]);
      if (button.hasAttribute('data-layout-reset')) {
        draft = normalize();
        dialog.querySelector('#layout-order').innerHTML = rows();
        dialog.querySelector('#layout-live').textContent = 'คืนลำดับเริ่มต้นในฉบับร่างแล้ว';
      }
      const direction = Number(button.dataset.layoutMove);
      if (!direction) return;
      const {layoutId:id} = button.closest('[data-layout-id]').dataset;
      move(id,draft.indexOf(id) + direction);
      const row = dialog.querySelector('[data-layout-id="' + id + '"]');
      (row.querySelector('[data-layout-move="' + direction + '"]:enabled') ??
        row.querySelector('[data-layout-move]:enabled')).focus({preventScroll:true});
    });

    function endDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const {list,source,target} = drag;
      drag = undefined;
      source.classList.remove('is-grabbed');
      target?.classList.remove('drop-before','drop-after');
      if (event.type === 'pointerup' && target && dialog.open && dialog.dataset.kind === 'layout') {
        move(source.dataset.layoutId,draft.indexOf(target.dataset.layoutId));
      }
      if (list.hasPointerCapture(event.pointerId)) list.releasePointerCapture(event.pointerId);
    }

    dialog.addEventListener('pointerdown', event => {
      const grip = event.target.closest('[data-layout-grip]');
      if (!grip || event.button !== 0 || drag) return;
      const list = grip.closest('#layout-order');
      const source = grip.closest('[data-layout-id]');
      list.setPointerCapture(event.pointerId);
      drag = {list,source,pointerId:event.pointerId,x:event.clientX,y:event.clientY};
      source.classList.add('is-grabbed');
    });
    dialog.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const {list,source,x,y} = drag;
      if (Math.hypot(event.clientX-x,event.clientY-y) < 5 && !drag.target) return;
      drag.target?.classList.remove('drop-before','drop-after');
      const row = document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-layout-id]');
      drag.target = row !== source && list.contains(row) ? row : null;
      if (drag.target) {
        const before = draft.indexOf(row.dataset.layoutId) < draft.indexOf(source.dataset.layoutId);
        row.classList.add(before ? 'drop-before' : 'drop-after');
      }
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) dialog.addEventListener(type,endDrag);

    function cancelPress() {
      if (!press) return;
      clearTimeout(press.timer);
      press = undefined;
    }
    root.addEventListener('pointerdown', event => {
      const heading = event.target.closest('[data-widget] .card-title');
      if (event.button !== 0 || !heading || heading.closest('[inert]') || !active() || dialog.open) return;
      cancelPress();
      const timer = setTimeout(() => {
        cancelPress();
        if (heading.isConnected && !heading.closest('[inert]') && active() && !dialog.open) {
          const button = root.querySelector('#layout-button');
          button.focus({preventScroll:true});
          button.click();
        }
      },550);
      press = {timer,x:event.clientX,y:event.clientY,id:event.pointerId};
    });
    root.addEventListener('contextmenu', event => {
      if (event.pointerType === 'touch' && event.target.closest('[data-widget] .card-title')) event.preventDefault();
    });
    document.addEventListener('pointermove', event => {
      if (press?.id === event.pointerId && Math.hypot(event.clientX-press.x,event.clientY-press.y) > 9) cancelPress();
    });
    for (const type of ['pointerup','pointercancel']) document.addEventListener(type,event => {
      if (press?.id === event.pointerId) cancelPress();
    });
    window.addEventListener('scroll',cancelPress,{capture:true,passive:true});
    dialog.addEventListener('close', () => { drag = undefined; });

    return {open:openEditor};
  }

  return {normalize,create};
})();
