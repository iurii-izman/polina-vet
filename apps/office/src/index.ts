import {
  addNote,
  createInquiry,
  getInquiry,
  json,
  listInquiries,
  markContacted,
  privateHeaders,
  purgeExpired,
  safeLog,
  setFollowUp,
  updateStatus,
  validateOfficeInquiry,
  verifyAccessJwt,
} from '@polina-vet/operations';
import type { D1Database } from '@cloudflare/workers-types';
import type { InquiryOutcome, InquiryStatus } from '@polina-vet/operations';

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  OFFICE_AUTH_BYPASS?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUDIENCE?: string;
  OFFICE_IDENTITIES?: string;
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  );
const localDate = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString();

function page() {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>POLINA VET Office</title><style>
:root{--forest:#2f493b;--deep:#22382d;--cream:#f4efe5;--card:#fffdf8;--muted:#646b63;--line:#d8d0c3;--red:#a8483b;--soft:#e6eadf;--radius:14px}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:#252823;font:16px/1.5 Inter,system-ui,sans-serif}a{color:inherit}button,input,select,textarea{font:inherit}button,.button{min-height:44px;border:1px solid var(--forest);border-radius:10px;padding:.65rem .9rem;background:var(--forest);color:#fff;cursor:pointer}button.secondary,.button.secondary{background:transparent;color:var(--forest)}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #c8794f;outline-offset:2px}.shell{max-width:1220px;margin:auto;padding:1rem}.top{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.75rem 0 1.5rem}.brand{font:700 1.35rem Georgia,serif;color:var(--deep)}.top small{color:var(--muted)}h1,h2,h3{line-height:1.12;font-family:Georgia,serif}.toolbar,.metrics,.layout{display:grid;gap:1rem}.metrics{grid-template-columns:repeat(4,1fr)}.metric,.card,.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:1rem;box-shadow:0 8px 20px #2528230d}.metric b{display:block;font-size:1.7rem;color:var(--deep)}.metric span{font-size:.85rem;color:var(--muted)}.toolbar{grid-template-columns:repeat(5,minmax(0,1fr));align-items:end;margin:1rem 0}.field{display:grid;gap:.35rem}.field label{font-size:.86rem;font-weight:700}.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);border-radius:9px;background:#fff;padding:.65rem}.layout{grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);align-items:start}.list{display:grid;gap:.75rem}.item{display:grid;gap:.35rem;border:1px solid var(--line);border-radius:12px;padding:.9rem;background:#fffdf8;cursor:pointer}.item:hover{border-color:var(--forest)}.item-head{display:flex;justify-content:space-between;gap:.5rem}.ref{font-weight:800;color:var(--forest)}.meta{color:var(--muted);font-size:.9rem}.tag{display:inline-block;border-radius:999px;background:var(--soft);padding:.15rem .5rem;font-size:.78rem}.tag.overdue{background:#f5e2dd;color:#7f2c23}.actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}.detail{position:sticky;top:1rem}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}.detail-grid dt{font-size:.78rem;color:var(--muted)}.detail-grid dd{margin:0}.note{border-top:1px solid var(--line);padding-top:.7rem;margin-top:.7rem}.empty{padding:2rem;text-align:center;color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(max-width:800px){.metrics{grid-template-columns:repeat(2,1fr)}.toolbar,.layout{grid-template-columns:1fr}.detail{position:static}.top{align-items:flex-start;flex-direction:column}.detail-grid{grid-template-columns:1fr 1fr}}@media(max-width:420px){.shell{padding:.75rem}.metrics{gap:.5rem}.metric{padding:.75rem}.item-head{display:block}.toolbar{margin-top:.5rem}}
</style></head><body><div class="shell"><header class="top"><div><div class="brand">POLINA VET Office</div><small>Inquiry operations · private surface</small></div><button class="secondary" id="refresh">Обновить</button></header><main><h1>Обращения</h1><section class="metrics" aria-label="Операционные показатели"><div class="metric"><b id="metric-new">—</b><span>Новые</span></div><div class="metric"><b id="metric-open">—</b><span>Открытые</span></div><div class="metric"><b id="metric-due">—</b><span>Сегодня</span></div><div class="metric"><b id="metric-overdue">—</b><span>Просрочены</span></div></section><section class="toolbar panel" aria-label="Фильтры"><div class="field"><label for="status">Статус</label><select id="status"><option value="">Все</option><option>NEW</option><option>IN_PROGRESS</option><option>WAITING</option><option>FOLLOW_UP</option><option>CLOSED</option></select></div><div class="field"><label for="domain">Контекст</label><select id="domain"><option value="">Все</option><option value="PET">Pets</option><option value="FARM">Farm</option></select></div><div class="field"><label for="followUp">Follow-up</label><select id="followUp"><option value="">Все</option><option value="due">Сегодня</option><option value="overdue">Просрочены</option></select></div><div class="field"><label for="search">Поиск</label><input id="search" type="search" placeholder="Имя, контакт, PV…"></div><button id="apply">Применить</button></section><div class="layout"><section><div class="actions"><button id="quick-add">+ Добавить обращение</button></div><div id="list" class="list" aria-live="polite"><div class="empty">Загрузка…</div></div></section><aside class="panel detail" id="detail"><h2>Выберите обращение</h2><p class="meta">Телефон, Telegram и внутренние заметки доступны после выбора записи.</p></aside></div></main></div><dialog id="add-dialog"><form method="dialog" class="panel" style="max-width:620px"><h2>Быстрое добавление</h2><div class="detail-grid"><div class="field"><label for="add-source">Источник</label><select id="add-source"><option>phone</option><option>telegram</option><option>viber</option><option>whatsapp</option><option>in_person</option><option>other</option></select></div><div class="field"><label for="add-domain">Контекст</label><select id="add-domain"><option value="PET">Домашнее животное</option><option value="FARM">Ферма</option></select></div><div class="field"><label for="add-name">Имя</label><input id="add-name" required maxlength="120"></div><div class="field"><label for="add-contact">Контакт</label><input id="add-contact" required maxlength="160"></div><div class="field"><label for="add-locality">Местность</label><input id="add-locality" required maxlength="120"></div><div class="field"><label for="add-species">Вид</label><input id="add-species" required maxlength="40"></div><div class="field"><label for="add-reason">Причина</label><input id="add-reason" required maxlength="60"></div><div class="field"><label for="add-summary">Кратко</label><textarea id="add-summary" required maxlength="1000"></textarea></div></div><div class="actions"><button value="cancel" class="secondary">Отмена</button><button id="save-add" value="default">Сохранить</button></div><p id="add-error" role="alert"></p></form></dialog><script>
const localDate=days=>new Date(Date.now()+days*86400000).toISOString();const $=id=>document.getElementById(id);let selected=null;const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const api=async(path,options={})=>{const r=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Операция не выполнена');return d};const params=()=>new URLSearchParams([...['status','domain','followUp','search'].map(k=>[$(k).value].filter(Boolean).map(v=>[k,v])).flat()]);const render=rows=>{$('list').innerHTML=rows.length?rows.map(row=>{const due=row.follow_up_at&&new Date(row.follow_up_at)<=new Date();return '<button class="item" data-id="'+esc(row.id)+'"><span class="item-head"><span class="ref">'+esc(row.public_ref)+'</span><span class="tag">'+esc(row.status)+'</span></span><span>'+esc(row.domain==='PET'?'Pets':'Farm')+' · '+esc(row.species)+' · '+esc(row.locality)+'</span><span class="meta">'+esc(row.reason)+' · '+esc(row.source)+' '+(due?'<span class="tag overdue">'+(new Date(row.follow_up_at).toDateString()===new Date().toDateString()?'TODAY':'OVERDUE')+'</span>':'')+'</span></button>'}).join(''):'<div class="empty">Нет обращений по фильтру.</div>';document.querySelectorAll('.item').forEach(x=>x.onclick=()=>show(x.dataset.id))};const load=async()=>{try{const d=await api('/api/inquiries?'+params());render(d.items);$('metric-new').textContent=d.metrics.new;$('metric-open').textContent=d.metrics.open;$('metric-due').textContent=d.metrics.due;$('metric-overdue').textContent=d.metrics.overdue}catch(e){$('list').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}};const show=async id=>{try{const d=await api('/api/inquiries/'+encodeURIComponent(id));selected=d.inquiry;const i=d.inquiry;$('detail').innerHTML='<h2>'+esc(i.public_ref)+'</h2><p><span class="tag">'+esc(i.status)+'</span> '+esc(i.domain==='PET'?'Pets':'Farm')+' · '+esc(i.source)+'</p><dl class="detail-grid"><div><dt>Имя</dt><dd>'+esc(i.person_name)+'</dd></div><div><dt>Контакт</dt><dd>'+esc(i.contact_value)+'</dd></div><div><dt>Местность</dt><dd>'+esc(i.locality)+'</dd></div><div><dt>Вид / причина</dt><dd>'+esc(i.species)+' · '+esc(i.reason)+'</dd></div><div><dt>Описание</dt><dd>'+esc(i.summary)+'</dd></div><div><dt>Follow-up</dt><dd>'+esc(i.follow_up_at||'—')+'</dd></div></dl><div class="actions"><button onclick="statusAction(&apos;IN_PROGRESS&apos;)">В работе</button><button onclick="statusAction(&apos;WAITING&apos;)" class="secondary">Ожидаем</button><button onclick="followAction(0)" class="secondary">Сегодня</button><button onclick="followAction(1)" class="secondary">Завтра</button><button onclick="followAction(3)" class="secondary">+3 дня</button><button onclick="contactAction()" class="secondary">Контакт отмечен</button><button onclick="closeAction()">Закрыть</button></div><div class="note"><h3>Добавить заметку</h3><textarea id="note-body" maxlength="2000" aria-label="Внутренняя заметка"></textarea><button onclick="noteAction()">Сохранить заметку</button></div><div class="note"><h3>История</h3>'+d.events.map(e=>'<p class="meta">'+esc(e.created_at)+' · '+esc(e.event_type)+'</p>').join('')+'</div>'}catch(e){$('detail').innerHTML='<p role="alert">'+esc(e.message)+'</p>'}};window.statusAction=async status=>{if(!selected)return;let outcome=null;if(status==='CLOSED')outcome=prompt('Outcome: visit_at_site / field_visit / advice_given / follow_up_completed / no_response / declined / duplicate / spam / other','visit_at_site');try{await api('/api/inquiries/'+selected.id+'/status',{method:'PATCH',body:JSON.stringify({status,outcome})});await load();await show(selected.id)}catch(e){alert(e.message)}};window.followAction=async days=>{if(!selected)return;try{await api('/api/inquiries/'+selected.id+'/follow-up',{method:'PATCH',body:JSON.stringify({follow_up_at:localDate(days)})});await load();await show(selected.id)}catch(e){alert(e.message)}};window.contactAction=async()=>{if(selected)await api('/api/inquiries/'+selected.id+'/contact',{method:'POST'});await load();if(selected)await show(selected.id)};window.noteAction=async()=>{const body=$('note-body').value;if(!body.trim()||!selected)return;await api('/api/inquiries/'+selected.id+'/notes',{method:'POST',body:JSON.stringify({body})});await show(selected.id)};window.closeAction=()=>statusAction('CLOSED');$('apply').onclick=load;$('refresh').onclick=load;$('quick-add').onclick=()=>$('add-dialog').showModal();$('save-add').onclick=async e=>{e.preventDefault();try{await api('/api/inquiries',{method:'POST',body:JSON.stringify({source:$('add-source').value,contactChannel:$('add-source').value,domain:$('add-domain').value,locale:'ru',personName:$('add-name').value,contactValue:$('add-contact').value,locality:$('add-locality').value,species:$('add-species').value,reason:$('add-reason').value,summary:$('add-summary').value,preferredContactChannel:$('add-source').value})});$('add-dialog').close();await load()}catch(e){$('add-error').textContent=e.message}};load();
</script></body></html>`;
}

async function auth(request: Request, env: Env) {
  if (env.OFFICE_AUTH_BYPASS === 'true')
    return env.ENVIRONMENT === 'test' && request.headers.get('X-Office-Test-Auth') === 'test-only'
      ? { actor: 'test-operator', role: 'TECH_ADMIN' as const }
      : null;
  return verifyAccessJwt(request, {
    teamDomain: env.ACCESS_TEAM_DOMAIN,
    audience: env.ACCESS_AUDIENCE,
    identities: (env.OFFICE_IDENTITIES ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  });
}

function response(data: unknown, status = 200) {
  const headers = privateHeaders();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return json(data, status, headers);
}

async function api(request: Request, env: Env, actor: string, path: string) {
  if (path === '/api/inquiries' && request.method === 'GET') {
    const url = new URL(request.url);
    const items = await listInquiries(env.DB, {
      status: url.searchParams.get('status') ?? undefined,
      domain: url.searchParams.get('domain') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      followUp: url.searchParams.get('followUp') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
    });
    const metricRows = await listInquiries(env.DB, {});
    const now = Date.now();
    const metrics = {
      new: metricRows.filter((i) => i.status === 'NEW').length,
      open: metricRows.filter((i) => i.status !== 'CLOSED').length,
      due: metricRows.filter(
        (i) =>
          i.status !== 'CLOSED' &&
          i.follow_up_at &&
          new Date(i.follow_up_at).toDateString() === new Date().toDateString(),
      ).length,
      overdue: metricRows.filter(
        (i) =>
          i.status !== 'CLOSED' &&
          i.follow_up_at &&
          new Date(i.follow_up_at).toDateString() !== new Date().toDateString() &&
          new Date(i.follow_up_at).getTime() < now,
      ).length,
    };
    return response({ items, metrics });
  }
  if (path === '/api/inquiries' && request.method === 'POST') {
    const input = await request.json();
    const result = validateOfficeInquiry(input);
    if (!result.ok)
      return response(
        { error: 'Проверьте поля', fields: result.issues.map((issue) => issue.field) },
        422,
      );
    const created = await createInquiry(
      env.DB,
      result.value,
      `office-${crypto.randomUUID()}`,
      actor,
    );
    return response({ public_ref: created.inquiry.public_ref, id: created.inquiry.id }, 201);
  }
  const match = path.match(/^\/api\/inquiries\/([^/]+)(?:\/(status|follow-up|contact|notes))?$/);
  if (!match) return response({ error: 'Not found' }, 404);
  const id = decodeURIComponent(match[1]);
  if (!match[2] && request.method === 'GET') {
    const record = await getInquiry(env.DB, id);
    return record ? response(record) : response({ error: 'Not found' }, 404);
  }
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (match[2] === 'status' && request.method === 'PATCH') {
    const result = await updateStatus(
      env.DB,
      id,
      payload.status as InquiryStatus,
      (payload.outcome as InquiryOutcome | null) ?? null,
      actor,
    );
    return result.ok
      ? response({ success: true })
      : response({ error: result.error }, result.error === 'not_found' ? 404 : 422);
  }
  if (match[2] === 'follow-up' && request.method === 'PATCH') {
    const followUpAt = typeof payload.follow_up_at === 'string' ? payload.follow_up_at : null;
    const result = await setFollowUp(env.DB, id, followUpAt, actor);
    return result.ok
      ? response({ success: true })
      : response({ error: result.error }, result.error === 'not_found' ? 404 : 422);
  }
  if (match[2] === 'contact' && request.method === 'POST') {
    const result = await markContacted(env.DB, id, actor);
    return result.ok ? response({ success: true }) : response({ error: result.error }, 404);
  }
  if (match[2] === 'notes' && request.method === 'POST') {
    const result = await addNote(env.DB, id, String(payload.body ?? ''), actor);
    return result.ok
      ? response({ success: true })
      : response({ error: result.error }, result.error === 'not_found' ? 404 : 422);
  }
  return response({ error: 'Method not allowed' }, 405);
}

export default {
  async fetch(request: Request, env: Env) {
    const headers = privateHeaders();
    if (env.ENVIRONMENT === 'production' && env.OFFICE_AUTH_BYPASS === 'true')
      return new Response('Misconfigured authentication', { status: 500, headers });
    const identity = await auth(request, env);
    if (!identity) return new Response('Authentication required', { status: 401, headers });
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/'))
        return await api(request, env, identity.actor, url.pathname);
      return new Response(page(), {
        headers: new Headers({
          ...Object.fromEntries(headers),
          'Content-Type': 'text/html; charset=utf-8',
        }),
      });
    } catch (error) {
      console.error(
        JSON.stringify(
          safeLog({
            operation: 'office_request',
            error_category: error instanceof Error ? error.name : 'unknown',
          }),
        ),
      );
      return response({ error: 'Операция не выполнена' }, 500);
    }
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    if (env.ENVIRONMENT === 'production') {
      const count = await purgeExpired(env.DB);
      console.log(JSON.stringify(safeLog({ operation: 'retention', count })));
    }
  },
};
