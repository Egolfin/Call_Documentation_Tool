'use strict';
(() => {
  const guide = window.GUIDE;
  const form = document.getElementById('fields');
  const note = document.getElementById('note');
  const copy = document.getElementById('copy');
  const status = document.getElementById('status');
  const dialog = document.getElementById('reset-dialog');
  const special = 'If Not Achieved, What Stopped It?';
  const controls = [];
  let lastCopied = null;
  let copying = false;
  if (!Array.isArray(guide) || !guide.length) {
    status.textContent = 'Guide could not be loaded. Check that guide.js is present.';
    return;
  }
  function update() {
    let count = 0;
    const lines = [];
    for (const control of controls) {
      const { group, select, section, other, input, help, hint } = control;
      const option = group.options[Number(select.value)];
      const selected = select.value !== '' && !!option;
      const needsOther = selected && group.field === special && option.response === 'Other:';
      other.hidden = !needsOther;
      input.required = needsOther;
      const valid = selected && (!needsOther || !!input.value.trim());
      section.classList.toggle('complete', valid);
      hint.hidden = !needsOther || !!input.value.trim();
      input.setAttribute('aria-invalid', String(needsOther && !input.value.trim()));
      help.textContent = selected ? (option.explanation || 'No additional guidance yet.') : 'Choose a response to see when to use it.';
      if (valid) count++;
      if (selected) lines.push(group.field + ': ' + (needsOther ? 'Other: ' + input.value.trim() : option.response));
    }
    note.value = lines.join('\n');
    copy.disabled = count !== guide.length || copying;
    document.getElementById('progress').textContent = count + ' of ' + guide.length + ' complete';
    const meter = document.getElementById('meter');
    meter.max = guide.length; meter.value = count;
    document.getElementById('readiness').textContent = count === guide.length ? 'Ready to copy. Review your note below.' : 'Complete every field to copy. Preview shows selected fields.';
  }
  for (const [index, group] of guide.entries()) {
    const section = document.createElement('div'); section.className = 'field';
    const label = document.createElement('label'); label.htmlFor = 'answer-' + index;
    const number = document.createElement('span'); number.className = 'number'; number.textContent = index + 1;
    label.append(number, document.createTextNode(group.field));
    const select = document.createElement('select'); select.id = label.htmlFor; select.required = true;
    select.add(new Option('Select one response...', ''));
    group.options.forEach((option, i) => select.add(new Option(option.response, String(i))));
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'When to use';
    const help = document.createElement('p'); help.id = 'guidance-' + index; select.setAttribute('aria-describedby', help.id);
    details.append(summary, help);
    const other = document.createElement('div'); other.className = 'other'; other.hidden = true;
    const inputLabel = document.createElement('label'); inputLabel.textContent = 'Explain what happened'; inputLabel.htmlFor = 'other-' + index;
    const input = document.createElement('input'); input.id = inputLabel.htmlFor; input.placeholder = 'Enter your explanation';
    const hint = document.createElement('p'); hint.id = 'hint-' + index; hint.textContent = 'An explanation is required for Other:.'; input.setAttribute('aria-describedby', hint.id);
    other.append(inputLabel, input, hint);
    section.append(label, select, details);
    if (group.field === special) section.append(other);
    controls.push({group, select, section, other, input, help, hint});
    select.addEventListener('change', () => {
      if (group.field === special && group.options[Number(select.value)]?.response !== 'Other:') input.value = '';
      status.textContent = ''; update();
      if (!other.hidden) input.focus();
    });
    input.addEventListener('input', () => { status.textContent = ''; update(); });
    form.append(section);
  }
  form.addEventListener('submit', event => event.preventDefault());
  async function copyNote() {
    update(); if (copy.disabled) return;
    const text = note.value;
    copying = true; update();
    try {
      try { await navigator.clipboard.writeText(text); }
      catch (_) {
        note.focus(); note.select();
        if (!document.execCommand('copy')) throw new Error('Manual copy required');
      }
      lastCopied = text;
      status.textContent = note.value === text ? 'Completed note copied.' : 'Previous note copied. Copy again to include your latest changes.';
    } catch (_) {
      note.focus(); note.select();
      status.textContent = 'Copy unavailable. Your note is selected. Press Ctrl / ⌘ + C to copy.';
    } finally { copying = false; update(); }
  }
  function reset() {
    controls.forEach(({select, input, section}) => { select.value = ''; input.value = ''; section.querySelector('details').open = false; });
    lastCopied = null; status.textContent = 'Ready for a new call.'; update(); controls[0].select.focus();
  }
  copy.addEventListener('click', copyNote);
  document.getElementById('reset').addEventListener('click', () => {
    const dirty = controls.some(({select, input}) => select.value !== '' || input.value);
    if (dirty && (lastCopied === null || note.value !== lastCopied)) dialog.showModal(); else reset();
  });
  document.getElementById('cancel').addEventListener('click', () => dialog.close());
  document.getElementById('confirm').addEventListener('click', () => { dialog.close(); reset(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !dialog.open) { event.preventDefault(); copyNote(); }
  });
  window.addEventListener('beforeunload', event => {
    if (controls.some(({select}) => select.value !== '') && (lastCopied === null || note.value !== lastCopied)) { event.preventDefault(); event.returnValue = ''; }
  });
  update();
})();
