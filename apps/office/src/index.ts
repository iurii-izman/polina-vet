import {
  addDiagnosis,
  addMedication,
  addNote,
  addPatientAlert,
  addProcedure,
  completeEncounter,
  createAnimal,
  createAnimalGroup,
  createClient,
  createEncounter,
  createFollowUp,
  createHolding,
  createInquiry,
  findClientMatches,
  getEncounter,
  getHolding,
  getInquiry,
  getPatient,
  json,
  listAnimalGroups,
  listAnimals,
  listClients,
  listHoldings,
  listInquiries,
  markContacted,
  privateHeaders,
  purgeExpired,
  recordVaccination,
  safeLog,
  searchM14,
  collectDailySnapshot,
  officeMutationOriginAllowed,
  PayloadTooLargeError,
  recordClientFrictionEvent,
  recordDailySnapshot,
  recordWorkflowEvent,
  readJsonBody,
  resolveOfficeTelemetryDataOrigin,
  routeClassForPath,
  toErrorCode,
  setFollowUp,
  updateEncounter,
  updateAnimal,
  updateAnimalGroup,
  updateClient,
  updateDiagnosis,
  updateHolding,
  updateStatus,
  validateAnimalGroupInput,
  validateAnimalInput,
  validateClientInput,
  validateClinicalChild,
  validateEncounterInput,
  validateEncounterUpdateInput,
  validateHoldingInput,
  validateOfficeInquiry,
  verifyAccessJwt,
} from '@polina-vet/operations';
import type { AnalyticsEngineDataset, D1Database } from '@cloudflare/workers-types';
import type {
  DiagnosisInput,
  EncounterInput,
  FollowUpInput,
  InquiryOutcome,
  InquiryStatus,
  M14Actor,
  MedicationInput,
  PatientAlertInput,
  ProcedureInput,
  VaccinationInput,
} from '@polina-vet/operations';

interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  OFFICE_AUTH_BYPASS?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUDIENCE?: string;
  OFFICE_IDENTITIES?: string;
  OFFICE_ORIGIN?: string;
  LEARNING?: AnalyticsEngineDataset;
  /** Temporary server-side secret for a controlled production acceptance run. */
  OFFICE_ACCEPTANCE_DATA_ORIGIN?: string;
  VERSION_METADATA?: { id: string; tag: string; timestamp: string };
  RELEASE?: string;
}
const maxBodyBytes = 64_000;
const errorStatus = (error: string) =>
  toErrorCode(error) === 'NOT_FOUND' ? 404 : toErrorCode(error) === 'CONFLICT' ? 409 : 422;
function response(data: unknown, status = 200) {
  const headers = privateHeaders();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return json(data, status, headers);
}
function errorResponse(error: string, status = errorStatus(error)) {
  const errorCode = toErrorCode(error);
  return response(
    {
      error,
      category: errorCode,
    },
    status,
  );
}

function telemetryContext(env: Env) {
  return {
    environment: env.ENVIRONMENT ?? 'unknown',
    service: 'office' as const,
    release:
      env.RELEASE?.trim() || env.VERSION_METADATA?.id || env.VERSION_METADATA?.tag || 'unversioned',
    dataOrigin: resolveOfficeTelemetryDataOrigin(
      env.ENVIRONMENT,
      env.OFFICE_ACCEPTANCE_DATA_ORIGIN,
    ),
  };
}

function emitWorkflow(env: Env, event: Parameters<typeof recordWorkflowEvent>[2]) {
  recordWorkflowEvent(env.LEARNING, telemetryContext(env), event);
}

function logRequest(
  env: Env,
  request: Request,
  actor: M14Actor,
  status: number,
  startedAt: number,
  error?: unknown,
) {
  console.log(
    JSON.stringify(
      safeLog({
        timestamp: new Date().toISOString(),
        service: 'office',
        environment: env.ENVIRONMENT ?? 'unknown',
        release: telemetryContext(env).release,
        request_id: actor.requestId,
        route_class: routeClassForPath(new URL(request.url).pathname),
        operation: 'OFFICE_REQUEST',
        result: status >= 500 ? 'FAILURE' : status >= 400 ? 'REJECTED' : 'SUCCESS',
        http_status: status,
        duration_ms: Date.now() - startedAt,
        error_code: error ? toErrorCode(error) : undefined,
      }),
    ),
  );
}
async function readBody(request: Request) {
  return readJsonBody(request, maxBodyBytes);
}

function page() {
  return String.raw`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>POLINA VET Office</title><style>
:root{--forest:#2f493b;--deep:#22382d;--cream:#f4efe5;--card:#fffdf8;--muted:#646b63;--line:#d8d0c3;--red:#a8483b;--soft:#e6eadf;--radius:14px}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:#252823;font:16px/1.5 Inter,system-ui,sans-serif}button,input,select,textarea{font:inherit}button{min-height:44px;border:1px solid var(--forest);border-radius:10px;padding:.65rem .9rem;background:var(--forest);color:#fff;cursor:pointer}button.secondary{background:transparent;color:var(--forest)}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #c8794f;outline-offset:2px}.shell{max-width:1220px;margin:auto;padding:1rem}.top{display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:.75rem 0 1rem}.brand{font:700 1.35rem Georgia,serif;color:var(--deep)}.meta{color:var(--muted);font-size:.9rem}.nav{display:flex;gap:.4rem;overflow:auto;padding:.25rem 0 1rem}.nav button{white-space:nowrap;background:transparent;color:var(--forest);border-color:transparent}.nav button[aria-current=page]{background:var(--forest);color:#fff}.metrics,.grid,.layout,.list,.form-grid{display:grid;gap:1rem}.metrics{grid-template-columns:repeat(4,1fr)}.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.metric,.card,.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:1rem;box-shadow:0 8px 20px #2528230d}.metric b{display:block;font-size:1.7rem;color:var(--deep)}.metric span{font-size:.85rem;color:var(--muted)}.toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:end;margin:1rem 0}.field{display:grid;gap:.35rem}.field label{font-size:.86rem;font-weight:700}.field input,.field select,.field textarea{width:100%;min-height:44px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:.65rem}.field textarea{min-height:100px}.item{text-align:left;width:100%;display:grid;gap:.25rem;background:#fffdf8;color:#252823;border-color:var(--line)}.item-head{display:flex;justify-content:space-between;gap:.5rem}.tag{display:inline-block;border-radius:999px;background:var(--soft);padding:.15rem .5rem;font-size:.78rem}.alert{background:#f5e2dd;color:#7f2c23}.actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}.layout{grid-template-columns:minmax(0,1.4fr) minmax(300px,1fr)}.timeline{border-left:3px solid var(--soft);padding-left:1rem}.notice{padding:.75rem;border-radius:10px;background:#f5e2dd;color:#7f2c23}.empty,.state{padding:2rem;text-align:center;color:var(--muted)}dialog{border:0;border-radius:16px;max-width:720px;width:calc(100% - 1rem);padding:0;background:transparent}dialog::backdrop{background:#22382d66}.form-grid{grid-template-columns:1fr 1fr}.full{grid-column:1/-1}@media(max-width:800px){.metrics,.grid,.layout{grid-template-columns:1fr 1fr}.layout{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}}@media(max-width:420px){.shell{padding:.75rem}.metrics,.grid{grid-template-columns:1fr 1fr}.metric{padding:.75rem}.nav{margin-inline:-.75rem;padding-inline:.75rem}}
</style></head><body><div class="shell"><header class="top"><div><div class="brand">POLINA VET Office</div><small class="meta">Операционная ветеринарная запись · приватный доступ</small></div><button class="secondary" id="refresh">Обновить</button></header><nav class="nav" aria-label="Навигация Office"><button data-view="home">Главная</button><button data-view="inquiries">Обращения</button><button data-view="patients">Пациенты</button><button data-view="holdings">Хозяйства</button><button data-view="encounters">Приёмы</button><button data-view="followups">Повторные</button><button data-view="search">Поиск</button></nav><main id="app" tabindex="-1"></main></div><dialog id="dialog"><div class="panel" id="dialog-content"></div></dialog><script>
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let view='home';const friction=async(eventName,extra={})=>{try{navigator.sendBeacon('/api/telemetry/client',new Blob([JSON.stringify({eventName,...extra})],{type:'application/json'}))}catch{}};const api=async(p,o={})=>{const r=await fetch(p,{...o,headers:{'Content-Type':'application/json',...(o.headers||{})}}),d=await r.json().catch(()=>({}));if(!r.ok){if(r.status===422)friction('CLIENT_VALIDATION_BLOCKED',{validationErrorCount:Array.isArray(d.fields)?d.fields.length:1});throw Error(d.error||'Операция не выполнена')}return d},fd=f=>Object.fromEntries(new FormData(f).entries());
const btn=(label,action,secondary=false)=>'<button data-action="'+action+'" class="'+(secondary?'secondary':'')+'">'+label+'</button>';const field=(label,name,type='text',extra='')=>'<div class="field"><label for="f-'+name+'">'+label+'</label><input id="f-'+name+'" name="'+name+'" type="'+type+'" '+extra+'></div>';
async function render(){document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-current',x.dataset.view===view?'page':'false'));try{if(view==='home')await home();else if(view==='inquiries')await inquiries();else if(view==='patients')await patients();else if(view==='holdings')await holdings();else if(view==='encounters')await encounters();else if(view==='followups')await followups();else await search()}catch(e){$('app').innerHTML='<div class="notice" role="alert">'+esc(e.message)+'</div>'}}
const shell=(title,body,actions='')=>'<section><header class="top"><div><p class="meta">POLINA VET Office</p><h1>'+title+'</h1></div><div class="actions">'+actions+'</div></header>'+body+'</section>';
async function home(){const d=await api('/api/inquiries');$('app').innerHTML=shell('Главная','<div class="metrics"><div class="metric"><b>'+d.metrics.new+'</b><span>Новые обращения</span></div><div class="metric"><b>'+d.metrics.open+'</b><span>Открытые обращения</span></div><div class="metric"><b>'+d.metrics.due+'</b><span>Повторные сегодня</span></div><div class="metric"><b>'+d.metrics.overdue+'</b><span>Просрочены</span></div></div><div class="actions">'+btn('+ Приём','new-encounter')+btn('+ Пациент','new-animal')+btn('+ Хозяйство','new-holding')+'</div><div class="grid"><div class="card"><h2>Рабочий маршрут</h2><p class="meta">Сначала найдите запись. Перед созданием показываются возможные совпадения.</p>'+btn('Открыть поиск','search',true)+'</div><div class="card"><h2>Черновики</h2><p class="meta">Приём можно сохранить на сервере и завершить позже.</p>'+btn('Открыть приёмы','encounters',true)+'</div><div class="card"><h2>Контекст</h2><p class="meta">Pets и Farm остаются отдельными рабочими сценариями.</p></div></div>');bind()}
async function inquiries(){const d=await api('/api/inquiries');$('app').innerHTML=shell('Обращения','<div class="toolbar"><div class="field"><label for="q">Имя, контакт или PV</label><input id="q" placeholder="Поиск"></div>'+btn('+ Обращение','new-inquiry')+'</div><div class="list">'+(d.items.map(i=>'<button class="item" data-inquiry="'+esc(i.id)+'"><span class="item-head"><b>'+esc(i.public_ref)+'</b><span class="tag">'+esc(i.status)+'</span></span><span>'+esc(i.domain)+' · '+esc(i.species)+' · '+esc(i.locality)+'</span><span class="meta">'+esc(i.person_name)+' · '+esc(i.reason)+'</span></button>').join('')||'<div class="empty">Нет обращений.</div>')+'</div>');document.querySelectorAll('[data-inquiry]').forEach(x=>x.onclick=()=>showInquiry(x.dataset.inquiry));bind()}
async function patients(){const d=await api('/api/animals');$('app').innerHTML=shell('Пациенты','<div class="toolbar"><p class="meta">Индивидуальные PET и FARM животные</p>'+btn('+ Пациент','new-animal')+'</div><div class="list">'+(d.items.map(a=>'<button class="item" data-patient="'+esc(a.id)+'"><span class="item-head"><b>'+esc(a.name||a.species_code)+'</b><span class="tag">'+esc(a.domain)+'</span></span><span>'+esc(a.species_code)+' · '+esc(a.sex)+(a.identifier?' · '+esc(a.identifier):'')+'</span></button>').join('')||'<div class="empty">Пациентов пока нет.</div>')+'</div>');document.querySelectorAll('[data-patient]').forEach(x=>x.onclick=()=>showPatient(x.dataset.patient));bind()}
async function holdings(){const d=await api('/api/holdings');$('app').innerHTML=shell('Хозяйства','<div class="toolbar"><p class="meta">Контакт, группы, индивидуальные животные и история выездов</p>'+btn('+ Хозяйство','new-holding')+'</div><div class="list">'+(d.items.map(h=>'<button class="item" data-holding="'+esc(h.id)+'"><b>'+esc(h.display_name||'Хозяйство')+'</b><span>'+esc(h.locality)+'</span><span class="meta">'+esc(h.client_name||'Контакт не указан')+'</span></button>').join('')||'<div class="empty">Хозяйств пока нет.</div>')+'</div>');document.querySelectorAll('[data-holding]').forEach(x=>x.onclick=()=>showHolding(x.dataset.holding));bind()}
async function encounters(){const d=await api('/api/encounters');$('app').innerHTML=shell('Приёмы','<div class="actions">'+btn('+ Приём','new-encounter')+'</div><div class="list">'+(d.items.map(e=>'<button class="item" data-encounter="'+esc(e.id)+'"><span class="item-head"><b>'+esc(e.encounter_type)+'</b><span class="tag">'+esc(e.status)+'</span></span><span>'+esc(e.started_at)+'</span><span class="meta">'+esc(e.subject_label||'Предмет')+'</span></button>').join('')||'<div class="empty">Приёмов пока нет.</div>')+'</div>');document.querySelectorAll('[data-encounter]').forEach(x=>x.onclick=()=>showEncounter(x.dataset.encounter));bind()}
async function followups(){const d=await api('/api/followups');$('app').innerHTML=shell('Повторные','<div class="list">'+(d.items.map(f=>'<article class="card"><b>'+esc(f.reason)+'</b><p class="meta">До '+esc(f.due_at)+' · '+esc(f.subject_label||'')+'</p></article>').join('')||'<div class="empty">Открытых повторных действий нет.</div>')+'</div>')}
async function search(){ $('app').innerHTML=shell('Поиск','<div class="toolbar"><div class="field"><label for="global-q">Пациенты, хозяйства, приёмы, PV</label><input id="global-q" placeholder="Введите запрос"></div>'+btn('Искать','do-search')+'</div><div id="results" class="list"><div class="empty">Поиск не выполнялся.</div></div>');bind() }
function bind(){document.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>{view=x.dataset.view;render()});document.querySelectorAll('[data-action]').forEach(x=>x.onclick=()=>action(x.dataset.action))}
async function action(a){if(['home','inquiries','patients','holdings','encounters','followups','search'].includes(a)){view=a;return render()}if(a==='new-client')return openClient();if(a==='new-animal')return openAnimal();if(a==='new-holding')return openHolding();if(a==='new-group')return openGroup();if(a==='new-encounter')return openEncounter();if(a==='new-inquiry')return openInquiry();if(a==='do-search'){const d=await api('/api/search',{method:'POST',body:JSON.stringify({q:$('global-q').value})});$('results').innerHTML=(d.items.map(x=>'<button class="item" data-result="'+esc(x.entity_type)+'" data-id="'+esc(x.id)+'"><b>'+esc(x.label)+'</b><span class="meta">'+esc(x.entity_type)+' · '+esc(x.detail)+'</span></button>').join('')||'<div class="empty">Ничего не найдено.</div>');document.querySelectorAll('[data-result]').forEach(x=>x.onclick=()=>openResult(x.dataset.result,x.dataset.id))}}
async function openResult(type,id){if(type==='ANIMAL')return showPatient(id);if(type==='HOLDING'||type==='ANIMAL_GROUP')return showHolding(id);if(type==='ENCOUNTER')return showEncounter(id);if(type==='INQUIRY')return showInquiry(id);view='patients';render()}
function form(title,fields,submit){$('dialog-content').innerHTML='<form id="form" class="panel"><h2>'+title+'</h2><div class="form-grid">'+fields+'</div><div class="actions"><button type="button" class="secondary" id="cancel">Отмена</button><button type="submit">Сохранить</button></div><p id="form-error" role="alert"></p></form>';$('dialog').showModal();$('cancel').onclick=()=>$('dialog').close();$('form').onsubmit=async e=>{e.preventDefault();try{await submit(fd(e.currentTarget));$('dialog').close();render()}catch(err){friction('CLIENT_RUNTIME_FAILURE',{errorCode:'UNHANDLED_CLIENT_ERROR'});$('form-error').textContent='Операция не выполнена'}}}
async function opts(path){const d=await api(path);return d.items.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.display_name||x.name||x.locality||x.species_code)+' · '+esc(x.locality||'')+'</option>').join('')}
function openClient(){form('Новый клиент',field('Имя владельца','displayName','text','required maxlength="160"')+field('Местность','locality')+field('Контакт','contactValue')+'<div class="field"><label for="f-contactType">Тип</label><select id="f-contactType" name="contactType"><option>PHONE</option><option>TELEGRAM</option><option>EMAIL</option><option>OTHER</option></select></div>'+field('Заметка','notes'),async f=>{const d=await api('/api/clients',{method:'POST',body:JSON.stringify({displayName:f.displayName,locality:f.locality,notes:f.notes,contacts:f.contactValue?[{type:f.contactType,value:f.contactValue,isPrimary:true}]:[]})});if(d.duplicates)throw Error('Возможно, такая запись уже существует. Проверьте список перед повторным сохранением.')})}
async function openAnimal(){const [cs,hs]=await Promise.all([opts('/api/clients'),opts('/api/holdings')]);form('Новый пациент','<div class="field"><label for="f-domain">Контекст</label><select id="f-domain" name="domain"><option>PET</option><option>FARM</option></select></div>'+field('Вид','speciesCode','text','required')+field('Имя (необязательно)','name')+field('Метка','identifier')+'<div class="field"><label for="f-clientId">Владелец</label><select id="f-clientId" name="clientId"><option value="">Не указан</option>'+cs+'</select></div><div class="field"><label for="f-holdingId">Хозяйство</label><select id="f-holdingId" name="holdingId"><option value="">Не указано</option>'+hs+'</select></div><div class="field"><label for="f-sex">Пол</label><select id="f-sex" name="sex"><option>UNKNOWN</option><option>MALE</option><option>FEMALE</option></select></div>'+field('Порода','breed')+field('Возраст текстом','ageText')+field('Заметка','notes'),async f=>api('/api/animals',{method:'POST',body:JSON.stringify(f)}))}
async function openHolding(){const cs=await opts('/api/clients');form('Новое хозяйство',field('Название','displayName')+'<div class="field"><label for="f-primaryClientId">Контакт</label><select id="f-primaryClientId" name="primaryClientId"><option value="">Не указан</option>'+cs+'</select></div>'+field('Местность','locality','text','required')+field('Адрес','addressText')+field('Заметка','notes'),async f=>api('/api/holdings',{method:'POST',body:JSON.stringify(f)}))}
function openGroup(holdingId=''){form('Новая группа',field('ID хозяйства','holdingId','text','required value="'+esc(holdingId)+'"')+field('Название группы','displayName','text','required')+field('Вид','speciesCode','text','required')+field('Примерное количество','approxCount','number','min="0"')+field('Возраст / описание','ageDescription')+field('Заметка','notes'),async f=>api('/api/animal-groups',{method:'POST',body:JSON.stringify({...f,approxCount:f.approxCount?Number(f.approxCount):undefined})}))}
async function openEncounter(type='',id=''){const [as,gs,hs]=await Promise.all([api('/api/animals'),api('/api/animal-groups'),api('/api/holdings')]);const options='<option value="">Выберите subject</option>'+as.items.map(x=>'<option data-type="animal" value="'+esc(x.id)+'">Животное: '+esc(x.name||x.species_code)+'</option>').join('')+gs.items.map(x=>'<option data-type="group" value="'+esc(x.id)+'">Группа: '+esc(x.display_name)+'</option>').join('')+hs.items.map(x=>'<option data-type="holding" value="'+esc(x.id)+'">Хозяйство: '+esc(x.display_name||x.locality)+'</option>').join('');form('Новый приём','<div class="field"><label for="f-encounterType">Тип</label><select id="f-encounterType" name="encounterType"><option>AT_SITE</option><option>FIELD_VISIT</option><option>REMOTE</option></select></div><div class="field full"><label for="f-subjectId">Предмет</label><select id="f-subjectId" name="subjectId" required>'+options+'</select></div><div class="field full"><label for="f-presentingProblem">С чем обратились</label><textarea id="f-presentingProblem" name="presentingProblem"></textarea></div><div class="field full"><label for="f-history">История</label><textarea id="f-history" name="history"></textarea></div><div class="field full"><label for="f-examinationText">Осмотр</label><textarea id="f-examinationText" name="examinationText"></textarea></div>'+field('Вес, кг','weightKg','number','step="0.01"')+field('Температура, °C','temperatureC','number','step="0.1"')+field('Всего в группе','populationCount','number','min="0"')+field('Осмотрено','examinedCount','number','min="0"')+field('Затронуто','affectedCount','number','min="0"')+field('Обработано','treatedCount','number','min="0"')+field('Рабочий диагноз','diagnosisLabel')+field('Medication / practical text','doseText')+field('Procedure','procedureLabel')+field('Повторное до','followUpAt','datetime-local')+field('Причина повторного','followUpReason')+'<div class="field full"><label><input type="checkbox" name="complete"> Завершить сейчас</label></div>',async f=>{const s=$('f-subjectId').selectedOptions[0],input={encounterType:f.encounterType,presentingProblem:f.presentingProblem,history:f.history,examinationText:f.examinationText,vitals:f.weightKg||f.temperatureC?{weightKg:f.weightKg?Number(f.weightKg):undefined,temperatureC:f.temperatureC?Number(f.temperatureC):undefined}:undefined,populationCounts:f.populationCount||f.examinedCount||f.affectedCount||f.treatedCount?{populationCount:f.populationCount?Number(f.populationCount):undefined,examinedCount:f.examinedCount?Number(f.examinedCount):undefined,affectedCount:f.affectedCount?Number(f.affectedCount):undefined,treatedCount:f.treatedCount?Number(f.treatedCount):undefined}:undefined};if(s.dataset.type==='animal')input.animalId=f.subjectId;if(s.dataset.type==='group')input.animalGroupId=f.subjectId;if(s.dataset.type==='holding')input.holdingId=f.subjectId;const d=await api('/api/encounters',{method:'POST',body:JSON.stringify(input)});if(f.diagnosisLabel)await api('/api/encounters/'+d.id+'/diagnoses',{method:'POST',body:JSON.stringify({type:'WORKING',label:f.diagnosisLabel})});if(f.doseText)await api('/api/encounters/'+d.id+'/medications',{method:'POST',body:JSON.stringify({administrationType:'PRESCRIBED',doseText:f.doseText})});if(f.procedureLabel)await api('/api/encounters/'+d.id+'/procedures',{method:'POST',body:JSON.stringify({type:'OTHER',label:f.procedureLabel})});if(f.followUpAt&&f.followUpReason){const follow={encounterId:d.id,dueAt:new Date(f.followUpAt).toISOString(),reason:f.followUpReason};if(s.dataset.type==='animal')follow.animalId=f.subjectId;if(s.dataset.type==='group')follow.animalGroupId=f.subjectId;if(s.dataset.type==='holding')follow.holdingId=f.subjectId;await api('/api/followups',{method:'POST',body:JSON.stringify(follow)})}if(f.complete)await api('/api/encounters/'+d.id+'/complete',{method:'POST',body:JSON.stringify({recordVersion:1})})})}
function openInquiry(){form('Новое обращение',field('Имя','personName','text','required')+field('Контакт','contactValue','text','required')+field('Местность','locality','text','required')+field('Вид','species','text','required')+field('Причина','reason','text','required')+'<div class="field"><label for="f-domain">Контекст</label><select id="f-domain" name="domain"><option>PET</option><option>FARM</option></select></div><div class="field full"><label for="f-summary">Кратко</label><textarea id="f-summary" name="summary" required></textarea></div>',async f=>api('/api/inquiries',{method:'POST',body:JSON.stringify({...f,locale:'ru',source:'manual',contactChannel:'phone',preferredContactChannel:'phone'})}))}
async function showPatient(id){const d=await api('/api/patients/'+encodeURIComponent(id));$('app').innerHTML=shell(esc(d.animal.name||d.animal.species_code),'<p>'+esc(d.animal.species_code)+' · '+esc(d.animal.sex)+' · '+esc(d.animal.client_name||'Владелец не указан')+'</p>'+(d.alerts.length?'<div class="notice"><b>⚠ Активные alerts</b>'+d.alerts.map(x=>'<p><span class="tag alert">'+esc(x.type)+'</span> '+esc(x.short_label)+'</p>').join('')+'</div>':'<div class="state">Активных alerts нет.</div>')+'<div class="actions">'+btn('+ Новый приём','p-encounter')+btn('+ Alert','p-alert',true)+'</div><h2>История</h2><div class="timeline">'+(d.encounters.map(x=>'<article><b>'+esc(x.encounter_type)+' · '+esc(x.status)+'</b><p class="meta">'+esc(x.started_at)+'</p></article>').join('')||'<div class="empty">Записей ещё нет.</div>')+'</div><h2>Вакцинации и повторные действия</h2>'+d.vaccinations.map(x=>'<div class="card"><b>'+esc(x.vaccine_name)+'</b><p class="meta">'+esc(x.date)+' · следующая: '+esc(x.next_due_at||'—')+'</p></div>').join('')+d.followups.map(x=>'<div class="card"><b>'+esc(x.reason)+'</b><p class="meta">До '+esc(x.due_at)+'</p></div>').join(''));document.querySelector('[data-action="p-encounter"]').onclick=()=>openEncounter('animal',id);document.querySelector('[data-action="p-alert"]').onclick=()=>form('Добавить alert',field('Тип','type','text','value="ALLERGY"')+field('Короткая отметка','shortLabel','text','required')+field('Комментарий','notes'),async f=>{await api('/api/animals/'+id+'/alerts',{method:'POST',body:JSON.stringify({...f,animalId:id})});showPatient(id)})}
async function showHolding(id){const d=await api('/api/holdings/'+encodeURIComponent(id));$('app').innerHTML=shell(esc(d.holding.display_name||'Хозяйство'),'<p>'+esc(d.holding.locality)+' · '+esc(d.holding.client_name||'Контакт не указан')+'</p><div class="actions">'+btn('+ Приём выезда','h-encounter')+btn('+ Группа','h-group',true)+btn('+ Животное','h-animal',true)+'</div><h2>Группы</h2><div class="list">'+d.groups.map(x=>'<div class="card"><b>'+esc(x.display_name)+'</b><p class="meta">'+esc(x.species_code)+' · примерно '+esc(x.approx_count??'—')+'</p></div>').join('')+'</div><h2>Индивидуальные животные</h2><div class="list">'+d.animals.map(x=>'<button class="item" data-patient="'+esc(x.id)+'"><b>'+esc(x.name||x.species_code)+'</b><span class="meta">'+esc(x.identifier||'Без метки')+'</span></button>').join('')+'</div><h2>История выездов</h2><div class="timeline">'+d.encounters.map(x=>'<article><b>'+esc(x.encounter_type)+' · '+esc(x.status)+'</b><p class="meta">'+esc(x.started_at)+'</p></article>').join('')+'</div>');document.querySelector('[data-action="h-encounter"]').onclick=()=>openEncounter('holding',id);document.querySelector('[data-action="h-group"]').onclick=()=>openGroup(id);document.querySelector('[data-action="h-animal"]').onclick=openAnimal;document.querySelectorAll('[data-patient]').forEach(x=>x.onclick=()=>showPatient(x.dataset.patient))}
async function showEncounter(id){const d=await api('/api/encounters/'+encodeURIComponent(id)),e=d.encounter;$('app').innerHTML=shell('Приём','<div class="card"><div class="item-head"><b>'+esc(e.encounter_type)+'</b><span class="tag">'+esc(e.status)+'</span></div><p class="meta">'+esc(e.started_at)+' · версия '+esc(e.record_version)+'</p><h2>С чем обратились</h2><p>'+esc(e.presenting_problem||'—')+'</p><h2>История</h2><p>'+esc(e.history||'—')+'</p><h2>Осмотр</h2><p>'+esc(e.examination_text||'—')+'</p>'+(d.vitals?'<h2>Vitals</h2><p>Вес: '+esc(d.vitals.weight_kg||'—')+' кг · Температура: '+esc(d.vitals.temperature_c||'—')+' °C</p>':'')+'<div class="actions">'+(e.status==='DRAFT'?btn('Завершить','complete-e'):'')+btn('Добавить диагноз','add-diagnosis',true)+btn('Добавить medication','add-medication',true)+'</div></div><h2>Диагнозы</h2>'+d.diagnoses.map(x=>'<div class="card"><b>'+esc(x.type)+'</b> · '+esc(x.label)+'</div>').join('')+'<h2>Medications</h2>'+d.medications.map(x=>'<div class="card"><b>'+esc(x.drug_name||'Практическая запись')+'</b><p>'+esc(x.dose_text||x.instructions||'')+'</p></div>').join('')+'<h2>Audit</h2>'+d.audit.map(x=>'<p class="meta">'+esc(x.created_at)+' · '+esc(x.action)+' · '+esc(x.changed_fields)+'</p>').join(''));const ce=document.querySelector('[data-action="complete-e"]');if(ce)ce.onclick=()=>form('Завершить приём','<div class="field full"><label for="f-outcomeText">Итог / план</label><textarea id="f-outcomeText" name="outcomeText"></textarea></div>',async f=>{await api('/api/encounters/'+id,{method:'PATCH',body:JSON.stringify({recordVersion:e.record_version,outcomeText:f.outcomeText,plan:f.outcomeText})});await api('/api/encounters/'+id+'/complete',{method:'POST',body:JSON.stringify({recordVersion:e.record_version+1})});showEncounter(id)});document.querySelector('[data-action="add-diagnosis"]').onclick=()=>form('Добавить диагноз','<div class="field"><label for="f-type">Тип</label><select id="f-type" name="type"><option>WORKING</option><option>DIFFERENTIAL</option><option>FINAL</option></select></div>'+field('Название','label','text','required')+field('Заметки','notes'),async f=>{await api('/api/encounters/'+id+'/diagnoses',{method:'POST',body:JSON.stringify(f)});showEncounter(id)});document.querySelector('[data-action="add-medication"]').onclick=()=>form('Добавить medication',field('Препарат','drugName')+field('Практический dose text','doseText','text','required')+field('Путь','route')+field('Частота','frequency')+'<div class="field"><label for="f-administrationType">Тип</label><select id="f-administrationType" name="administrationType"><option>ADMINISTERED</option><option>PRESCRIBED</option><option>RECOMMENDED</option></select></div>',async f=>{await api('/api/encounters/'+id+'/medications',{method:'POST',body:JSON.stringify(f)});showEncounter(id)})}
async function showInquiry(id){const d=await api('/api/inquiries/'+encodeURIComponent(id)),i=d.inquiry;$('app').innerHTML=shell(esc(i.public_ref),'<div class="card"><p>'+esc(i.person_name)+' · '+esc(i.contact_value)+'</p><p>'+esc(i.summary)+'</p><div class="actions">'+btn('Создать клиента','i-client')+btn('Отметить контакт','i-contact',true)+'</div></div>');document.querySelector('[data-action="i-contact"]').onclick=async()=>{await api('/api/inquiries/'+id+'/contact',{method:'POST'});showInquiry(id)};document.querySelector('[data-action="i-client"]').onclick=openClient}
function openVaccination(animalId='',animalGroupId=''){form('Записать вакцинацию',field('ID животного','animalId','text',animalId?'value="'+esc(animalId)+'" required':animalGroupId?'':'required')+field('ID группы','animalGroupId','text',animalGroupId?'value="'+esc(animalGroupId)+'" required':'')+field('Дата','date','date','required')+field('Вакцина','vaccineName','text','required')+field('Производитель','manufacturer')+field('Партия','batchLot')+field('Следующая дата','nextDueAt','date')+field('Заметки','notes'),async f=>api('/api/vaccinations',{method:'POST',body:JSON.stringify({...f,animalId:f.animalId||undefined,animalGroupId:f.animalGroupId||undefined})}))}
const baseShowPatient=showPatient;showPatient=async id=>{await baseShowPatient(id);const actions=document.querySelector('[data-action="p-encounter"]')?.parentElement;if(actions&&!actions.querySelector('[data-action="p-vaccination"]')){actions.insertAdjacentHTML('beforeend',btn('+ Вакцинация','p-vaccination',true));actions.querySelector('[data-action="p-vaccination"]').onclick=()=>openVaccination(id)}};
function openEncounterCorrection(id,d){const diagnosis=d.diagnoses[0];form('Исправить клиническую запись','<div class="field full"><label for="f-assessment">Оценка</label><textarea id="f-assessment" name="assessment">'+esc(d.encounter.assessment)+'</textarea></div><div class="field"><label for="f-diagnosisType">Тип диагноза</label><select id="f-diagnosisType" name="diagnosisType"><option '+(diagnosis?.type==='WORKING'?'selected':'')+'>WORKING</option><option '+(diagnosis?.type==='DIFFERENTIAL'?'selected':'')+'>DIFFERENTIAL</option><option '+(diagnosis?.type==='FINAL'?'selected':'')+'>FINAL</option></select></div>'+field('Диагноз','diagnosisLabel','text','value="'+esc(diagnosis?.label)+'"')+'<div class="field full"><label for="f-plan">План / итог</label><textarea id="f-plan" name="plan">'+esc(d.encounter.plan||d.encounter.outcome_text)+'</textarea></div>',async f=>{await api('/api/encounters/'+id,{method:'PATCH',body:JSON.stringify({recordVersion:d.encounter.record_version,assessment:f.assessment,plan:f.plan,outcomeText:f.plan})});if(f.diagnosisLabel){const endpoint=diagnosis?'/api/diagnoses/'+diagnosis.id:'/api/encounters/'+id+'/diagnoses';await api(endpoint,{method:diagnosis?'PATCH':'POST',body:JSON.stringify({type:f.diagnosisType,label:f.diagnosisLabel,recordVersion:diagnosis?.record_version})})}showEncounter(id)})}
const baseShowEncounter=showEncounter;showEncounter=async id=>{await baseShowEncounter(id);const actions=document.querySelector('[data-action="complete-e"]')?.parentElement||document.querySelector('[data-action="add-diagnosis"]')?.parentElement;if(actions&&!actions.querySelector('[data-action="correct-encounter"]')){actions.insertAdjacentHTML('beforeend',btn('Исправить запись','correct-encounter',true));actions.querySelector('[data-action="correct-encounter"]').onclick=async()=>{const d=await api('/api/encounters/'+encodeURIComponent(id));openEncounterCorrection(id,d)}}};
const baseShowHolding=showHolding;showHolding=async id=>{await baseShowHolding(id);const d=await api('/api/holdings/'+encodeURIComponent(id)),cards=[...document.querySelectorAll('#app .list .card')];d.groups.forEach((g,i)=>{const card=cards[i];if(!card)return;card.insertAdjacentHTML('beforeend','<div class="actions">'+btn('Записать вакцинацию','group-vaccination-'+g.id,true)+'</div>');card.querySelector('[data-action="group-vaccination-'+g.id+'"]').onclick=()=>openVaccination('',g.id)})};
 document.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>{view=x.dataset.view;render()});$('refresh').onclick=render;render();</script></body></html>`;
}

async function auth(request: Request, env: Env) {
  if (env.OFFICE_AUTH_BYPASS === 'true')
    return env.ENVIRONMENT === 'test'
      ? { actor: 'test-operator', role: 'TECH_ADMIN' as const }
      : null;
  return verifyAccessJwt(request, {
    teamDomain: env.ACCESS_TEAM_DOMAIN,
    audience: env.ACCESS_AUDIENCE,
    identities: (env.OFFICE_IDENTITIES ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
  });
}

async function m14Api(request: Request, env: Env, actor: M14Actor, path: string) {
  if (path === '/api/clients' && request.method === 'GET')
    return response({
      items: await listClients(env.DB, ''),
    });
  if (path === '/api/clients' && request.method === 'POST') {
    const raw = await readBody(request),
      result = validateClientInput(raw);
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const duplicates = await findClientMatches(env.DB, result.value);
    if (duplicates.length && raw.confirmDuplicate !== true) {
      emitWorkflow(env, {
        eventName: 'DUPLICATE_CANDIDATE_SHOWN',
        routeClass: 'api_clients',
        operation: 'CREATE_CLIENT',
        result: 'CONFLICT',
        domain: 'NONE',
      });
      return response({ duplicates }, 409);
    }
    const id = await createClient(env.DB, result.value, actor);
    emitWorkflow(env, {
      eventName: 'CLIENT_CREATED',
      routeClass: 'api_clients',
      operation: 'CREATE_CLIENT',
      result: 'SUCCESS',
      domain: 'NONE',
    });
    if (duplicates.length)
      emitWorkflow(env, {
        eventName: 'NEW_RECORD_CREATED_AFTER_DUPLICATE_WARNING',
        routeClass: 'api_clients',
        operation: 'CREATE_CLIENT',
        result: 'SUCCESS',
        domain: 'NONE',
      });
    return response({ id }, 201);
  }
  const client = path.match(/^\/api\/clients\/([^/]+)$/);
  if (client && request.method === 'PATCH') {
    const raw = await readBody(request),
      result = validateClientInput(raw);
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const updated = await updateClient(
      env.DB,
      decodeURIComponent(client[1]),
      result.value,
      Number(raw.recordVersion),
      actor,
    );
    return updated.ok ? response({ success: true }) : errorResponse(updated.error);
  }
  if (path === '/api/holdings' && request.method === 'GET')
    return response({
      items: await listHoldings(env.DB, ''),
    });
  if (path === '/api/holdings' && request.method === 'POST') {
    const result = validateHoldingInput(await readBody(request));
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const id = await createHolding(env.DB, result.value, actor);
    emitWorkflow(env, {
      eventName: 'HOLDING_CREATED',
      routeClass: 'api_holdings',
      operation: 'CREATE_HOLDING',
      result: 'SUCCESS',
      domain: 'FARM',
      subjectType: 'HOLDING',
    });
    return response({ id }, 201);
  }
  const holding = path.match(/^\/api\/holdings\/([^/]+)$/);
  if (holding && request.method === 'PATCH') {
    const raw = await readBody(request),
      result = validateHoldingInput(raw);
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const updated = await updateHolding(
      env.DB,
      decodeURIComponent(holding[1]),
      result.value,
      Number(raw.recordVersion),
      actor,
    );
    return updated.ok ? response({ success: true }) : errorResponse(updated.error);
  }
  if (path === '/api/animals' && request.method === 'GET') {
    const u = new URL(request.url);
    return response({
      items: await listAnimals(env.DB, '', u.searchParams.get('holdingId') ?? undefined),
    });
  }
  if (path === '/api/animals' && request.method === 'POST') {
    const result = validateAnimalInput(await readBody(request));
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const id = await createAnimal(env.DB, result.value, actor);
    emitWorkflow(env, {
      eventName: 'ANIMAL_CREATED',
      routeClass: 'api_animals',
      operation: 'CREATE_ANIMAL',
      result: 'SUCCESS',
      domain: result.value.domain,
      subjectType: 'ANIMAL',
    });
    return response({ id }, 201);
  }
  const animal = path.match(/^\/api\/animals\/([^/]+)$/);
  if (animal && request.method === 'PATCH') {
    const raw = await readBody(request),
      result = validateAnimalInput(raw);
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const updated = await updateAnimal(
      env.DB,
      decodeURIComponent(animal[1]),
      result.value,
      Number(raw.recordVersion),
      actor,
    );
    return updated.ok ? response({ success: true }) : errorResponse(updated.error);
  }
  if (path === '/api/animal-groups' && request.method === 'GET')
    return response({
      items: await listAnimalGroups(
        env.DB,
        new URL(request.url).searchParams.get('holdingId') ?? undefined,
      ),
    });
  if (path === '/api/animal-groups' && request.method === 'POST') {
    const result = validateAnimalGroupInput(await readBody(request));
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const id = await createAnimalGroup(env.DB, result.value, actor);
    emitWorkflow(env, {
      eventName: 'ANIMAL_GROUP_CREATED',
      routeClass: 'api_animal_groups',
      operation: 'CREATE_ANIMAL_GROUP',
      result: 'SUCCESS',
      domain: 'FARM',
      subjectType: 'ANIMAL_GROUP',
    });
    return response({ id }, 201);
  }
  const animalGroup = path.match(/^\/api\/animal-groups\/([^/]+)$/);
  if (animalGroup && request.method === 'PATCH') {
    const raw = await readBody(request),
      result = validateAnimalGroupInput(raw);
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const updated = await updateAnimalGroup(
      env.DB,
      decodeURIComponent(animalGroup[1]),
      result.value,
      Number(raw.recordVersion),
      actor,
    );
    return updated.ok ? response({ success: true }) : errorResponse(updated.error);
  }
  if (path === '/api/encounters' && request.method === 'GET') {
    const r = await env.DB.prepare(
      'SELECT e.*, COALESCE(a.name, ag.display_name, h.display_name, h.locality) AS subject_label FROM encounters e LEFT JOIN animals a ON a.id=e.animal_id LEFT JOIN animal_groups ag ON ag.id=e.animal_group_id LEFT JOIN holdings h ON h.id=e.holding_id ORDER BY e.started_at DESC LIMIT 100',
    ).all();
    return response({ items: r.results ?? [] });
  }
  if (path === '/api/encounters' && request.method === 'POST') {
    const result = validateEncounterInput(await readBody(request));
    if (!result.ok)
      return response(
        { error: 'Проверьте предмет и поля', fields: result.issues.map((x) => x.field) },
        422,
      );
    const created = await createEncounter(env.DB, result.value, actor);
    if (!created.ok) return errorResponse(created.error);
    emitWorkflow(env, {
      eventName: 'ENCOUNTER_STARTED',
      routeClass: 'api_encounters',
      operation: 'CREATE_ENCOUNTER',
      result: 'SUCCESS',
      domain: result.value.animalId ? 'PET' : 'FARM',
      subjectType: result.value.animalId
        ? 'ANIMAL'
        : result.value.animalGroupId
          ? 'ANIMAL_GROUP'
          : 'HOLDING',
      encounterType: result.value.encounterType,
      source: result.value.source === 'INQUIRY' ? 'INQUIRY' : 'MANUAL',
    });
    return response({ id: created.id }, 201);
  }
  if (path === '/api/followups' && request.method === 'GET') {
    const r = await env.DB.prepare(
      "SELECT f.*, COALESCE(a.name, ag.display_name, h.display_name, h.locality) AS subject_label FROM clinical_followups f LEFT JOIN animals a ON a.id=f.animal_id LEFT JOIN animal_groups ag ON ag.id=f.animal_group_id LEFT JOIN holdings h ON h.id=f.holding_id WHERE f.status='OPEN' ORDER BY f.due_at LIMIT 100",
    ).all();
    return response({ items: r.results ?? [] });
  }
  if (path === '/api/followups' && request.method === 'POST') {
    const raw = await readBody(request),
      valid = validateClinicalChild('followup', raw);
    if (!valid.ok) return response({ error: 'Проверьте повторное действие' }, 422);
    const created = await createFollowUp(env.DB, raw as unknown as FollowUpInput, actor);
    if (!created.ok) return errorResponse(created.error);
    emitWorkflow(env, {
      eventName: 'FOLLOWUP_CREATED',
      routeClass: 'api_followups',
      operation: 'CREATE_FOLLOWUP',
      result: 'SUCCESS',
      domain: raw.animalId ? 'PET' : 'FARM',
      subjectType: raw.animalId ? 'ANIMAL' : raw.animalGroupId ? 'ANIMAL_GROUP' : 'HOLDING',
    });
    return response({ id: created.id }, 201);
  }
  const p = path.match(/^\/api\/patients\/([^/]+)$/);
  if (p && request.method === 'GET') {
    const r = await getPatient(env.DB, decodeURIComponent(p[1]));
    return r ? response(r) : errorResponse('not_found');
  }
  if (holding && request.method === 'GET') {
    const r = await getHolding(env.DB, decodeURIComponent(holding[1]));
    return r ? response(r) : errorResponse('not_found');
  }
  const alert = path.match(/^\/api\/animals\/([^/]+)\/alerts$/);
  if (alert && request.method === 'POST') {
    const raw = await readBody(request),
      valid = validateClinicalChild('alert', raw);
    if (!valid.ok) return response({ error: 'Проверьте alert' }, 422);
    const r = await addPatientAlert(
      env.DB,
      { ...raw, animalId: decodeURIComponent(alert[1]) } as unknown as PatientAlertInput,
      actor,
    );
    return r.ok ? response({ id: r.id }, 201) : errorResponse(r.error);
  }
  if (path === '/api/vaccinations' && request.method === 'POST') {
    const raw = await readBody(request),
      valid = validateClinicalChild('vaccination', raw);
    if (!valid.ok) return response({ error: 'Проверьте вакцинацию' }, 422);
    const r = await recordVaccination(env.DB, raw as unknown as VaccinationInput, actor);
    if (!r.ok) return errorResponse(r.error);
    emitWorkflow(env, {
      eventName: 'VACCINATION_RECORDED',
      routeClass: 'api_vaccinations',
      operation: 'RECORD_VACCINATION',
      result: 'SUCCESS',
      domain: raw.animalId ? 'PET' : 'FARM',
      subjectType: raw.animalId ? 'ANIMAL' : 'ANIMAL_GROUP',
    });
    return response({ id: r.id }, 201);
  }
  const diagnosis = path.match(/^\/api\/diagnoses\/([^/]+)$/);
  if (diagnosis && request.method === 'PATCH') {
    const raw = await readBody(request),
      valid = validateClinicalChild('diagnosis', raw);
    if (!valid.ok) return response({ error: 'Проверьте диагноз' }, 422);
    const r = await updateDiagnosis(
      env.DB,
      decodeURIComponent(diagnosis[1]),
      raw as unknown as DiagnosisInput,
      Number(raw.recordVersion),
      actor,
    );
    return r.ok ? response({ success: true }) : errorResponse(r.error);
  }
  const e = path.match(
    /^\/api\/encounters\/([^/]+)(?:\/(complete|diagnoses|medications|procedures|vaccinations))?$/,
  );
  if (e) {
    const id = decodeURIComponent(e[1]),
      sub = e[2];
    if (!sub && request.method === 'GET') {
      const r = await getEncounter(env.DB, id);
      return r ? response(r) : errorResponse('not_found');
    }
    if (!sub && request.method === 'PATCH') {
      const raw = await readBody(request),
        valid = validateEncounterUpdateInput(raw);
      if (!valid.ok)
        return response(
          { error: 'Проверьте поля приёма', fields: valid.issues.map((x) => x.field) },
          422,
        );
      const before = await env.DB.prepare(
        'SELECT status, encounter_type, animal_id, animal_group_id, holding_id FROM encounters WHERE id = ?',
      )
        .bind(id)
        .first<{
          status: string;
          encounter_type: 'AT_SITE' | 'FIELD_VISIT' | 'REMOTE';
          animal_id: string | null;
          animal_group_id: string | null;
          holding_id: string | null;
        }>();
      const r = await updateEncounter(env.DB, id, valid.value, Number(raw.recordVersion), actor);
      if (!r.ok) {
        if (r.error === 'conflict')
          emitWorkflow(env, {
            eventName: 'VERSION_CONFLICT',
            routeClass: 'api_encounters',
            operation: 'UPDATE_ENCOUNTER',
            result: 'CONFLICT',
            errorCode: 'CONFLICT',
          });
        return errorResponse(r.error);
      }
      const subjectType = before?.animal_id
        ? 'ANIMAL'
        : before?.animal_group_id
          ? 'ANIMAL_GROUP'
          : 'HOLDING';
      emitWorkflow(env, {
        eventName: before?.status === 'COMPLETED' ? 'ENCOUNTER_CORRECTED' : 'ENCOUNTER_DRAFT_SAVED',
        routeClass: 'api_encounters',
        operation: 'UPDATE_ENCOUNTER',
        result: 'SUCCESS',
        domain: before?.animal_id ? 'PET' : 'FARM',
        subjectType,
        encounterType: before?.encounter_type,
        changedFieldCount: Object.keys(valid.value).length,
      });
      return response({ success: true });
    }
    if (sub === 'complete' && request.method === 'POST') {
      const raw = await readBody(request),
        r = await completeEncounter(env.DB, id, Number(raw.recordVersion), actor);
      if (!r.ok) {
        if (r.error === 'conflict')
          emitWorkflow(env, {
            eventName: 'VERSION_CONFLICT',
            routeClass: 'api_encounters',
            operation: 'COMPLETE_ENCOUNTER',
            result: 'CONFLICT',
            errorCode: 'CONFLICT',
          });
        return errorResponse(r.error);
      }
      const completed = await env.DB.prepare(
        'SELECT started_at, completed_at, encounter_type, animal_id, animal_group_id FROM encounters WHERE id = ?',
      )
        .bind(id)
        .first<{
          started_at: string;
          completed_at: string;
          encounter_type: 'AT_SITE' | 'FIELD_VISIT' | 'REMOTE';
          animal_id: string | null;
          animal_group_id: string | null;
        }>();
      const workflowDurationMs = completed?.completed_at
        ? Math.max(0, Date.parse(completed.completed_at) - Date.parse(completed.started_at))
        : undefined;
      emitWorkflow(env, {
        eventName: 'ENCOUNTER_COMPLETED',
        routeClass: 'api_encounters',
        operation: 'COMPLETE_ENCOUNTER',
        result: 'SUCCESS',
        domain: completed?.animal_id ? 'PET' : 'FARM',
        subjectType: completed?.animal_id
          ? 'ANIMAL'
          : completed?.animal_group_id
            ? 'ANIMAL_GROUP'
            : 'HOLDING',
        encounterType: completed?.encounter_type,
        workflowDurationMs,
      });
      return response({ success: true });
    }
    if (
      sub === 'diagnoses' ||
      sub === 'medications' ||
      sub === 'procedures' ||
      sub === 'vaccinations'
    ) {
      const raw = await readBody(request),
        kind =
          sub === 'diagnoses'
            ? 'diagnosis'
            : sub === 'medications'
              ? 'medication'
              : sub === 'procedures'
                ? 'procedure'
                : 'vaccination',
        valid = validateClinicalChild(kind, raw);
      if (!valid.ok) return response({ error: 'Проверьте запись' }, 422);
      const r =
        sub === 'diagnoses'
          ? await addDiagnosis(env.DB, id, raw as unknown as DiagnosisInput, actor)
          : sub === 'medications'
            ? await addMedication(env.DB, id, raw as unknown as MedicationInput, actor)
            : sub === 'procedures'
              ? await addProcedure(env.DB, id, raw as unknown as ProcedureInput, actor)
              : await recordVaccination(
                  env.DB,
                  { ...raw, encounterId: id } as unknown as VaccinationInput,
                  actor,
                );
      if (!r.ok) {
        if (r.error === 'conflict')
          emitWorkflow(env, {
            eventName: 'VERSION_CONFLICT',
            routeClass: sub === 'diagnoses' ? 'api_diagnoses' : 'api_encounters',
            operation: 'ADD_CLINICAL_CHILD',
            result: 'CONFLICT',
            errorCode: 'CONFLICT',
          });
        return errorResponse(r.error);
      }
      const childEvent =
        sub === 'diagnoses'
          ? 'DIAGNOSIS_ADDED'
          : sub === 'medications'
            ? 'MEDICATION_ADDED'
            : sub === 'procedures'
              ? 'PROCEDURE_ADDED'
              : 'VACCINATION_RECORDED';
      emitWorkflow(env, {
        eventName: childEvent,
        routeClass: sub === 'diagnoses' ? 'api_diagnoses' : 'api_encounters',
        operation: 'ADD_CLINICAL_CHILD',
        result: 'SUCCESS',
        domain:
          sub === 'diagnoses' || sub === 'medications' || sub === 'procedures' ? 'PET' : 'FARM',
      });
      return response({ id: r.id }, 201);
    }
  }
  if (path === '/api/search' && request.method === 'POST') {
    const startedAt = Date.now();
    const raw = await readBody(request);
    const items = await searchM14(env.DB, typeof raw.q === 'string' ? raw.q : '');
    emitWorkflow(env, {
      eventName: 'SEARCH_EXECUTED',
      routeClass: 'api_search',
      operation: 'SEARCH',
      result: 'SUCCESS',
      resultCount: items.length,
      durationMs: Date.now() - startedAt,
    });
    return response({ items });
  }
  if (path === '/api/telemetry/client' && request.method === 'POST') {
    const raw = await readBody(request);
    const clientEvents = new Set([
      'CLIENT_VALIDATION_BLOCKED',
      'UNSAVED_NAVIGATION_WARNING',
      'CLIENT_NETWORK_RETRY',
      'CLIENT_RUNTIME_FAILURE',
    ] as const);
    const eventName = raw.eventName;
    if (typeof eventName !== 'string' || !clientEvents.has(eventName as never))
      return errorResponse('validation');
    const validationErrorCount =
      typeof raw.validationErrorCount === 'number' && Number.isInteger(raw.validationErrorCount)
        ? raw.validationErrorCount
        : undefined;
    recordClientFrictionEvent(
      env.LEARNING,
      telemetryContext(env),
      {
        eventName: eventName as
          | 'CLIENT_VALIDATION_BLOCKED'
          | 'UNSAVED_NAVIGATION_WARNING'
          | 'CLIENT_NETWORK_RETRY'
          | 'CLIENT_RUNTIME_FAILURE',
        operation: 'CLIENT_FRICTION',
        errorCode:
          typeof raw.errorCode === 'string' && raw.errorCode === 'UNHANDLED_CLIENT_ERROR'
            ? 'UNHANDLED_CLIENT_ERROR'
            : undefined,
        validationErrorCount,
      },
      'api_client_telemetry',
    );
    return new Response(null, { status: 204, headers: privateHeaders() });
  }
  return null;
}

async function m13Api(request: Request, env: Env, actor: string, path: string) {
  if (path === '/api/inquiries' && request.method === 'GET') {
    const u = new URL(request.url),
      items = await listInquiries(env.DB, {
        status: u.searchParams.get('status') ?? undefined,
        domain: u.searchParams.get('domain') ?? undefined,
        source: u.searchParams.get('source') ?? undefined,
        followUp: u.searchParams.get('followUp') ?? undefined,
        search: u.searchParams.get('search') ?? undefined,
      }),
      all = await listInquiries(env.DB, {}),
      now = Date.now();
    return response({
      items,
      metrics: {
        new: all.filter((i) => i.status === 'NEW').length,
        open: all.filter((i) => i.status !== 'CLOSED').length,
        due: all.filter(
          (i) =>
            i.status !== 'CLOSED' &&
            i.follow_up_at &&
            new Date(i.follow_up_at).toDateString() === new Date().toDateString(),
        ).length,
        overdue: all.filter(
          (i) =>
            i.status !== 'CLOSED' &&
            i.follow_up_at &&
            new Date(i.follow_up_at).toDateString() !== new Date().toDateString() &&
            new Date(i.follow_up_at).getTime() < now,
        ).length,
      },
    });
  }
  if (path === '/api/inquiries' && request.method === 'POST') {
    const result = validateOfficeInquiry(await readBody(request));
    if (!result.ok)
      return response({ error: 'Проверьте поля', fields: result.issues.map((x) => x.field) }, 422);
    const created = await createInquiry(
      env.DB,
      result.value,
      'office-' + crypto.randomUUID(),
      actor,
    );
    return response({ public_ref: created.inquiry.public_ref, id: created.inquiry.id }, 201);
  }
  const m = path.match(/^\/api\/inquiries\/([^/]+)(?:\/(status|follow-up|contact|notes))?$/);
  if (!m) return null;
  const id = decodeURIComponent(m[1]);
  if (!m[2] && request.method === 'GET') {
    const r = await getInquiry(env.DB, id);
    return r ? response(r) : errorResponse('not_found');
  }
  const raw = await readBody(request);
  if (m[2] === 'status' && request.method === 'PATCH') {
    const r = await updateStatus(
      env.DB,
      id,
      raw.status as InquiryStatus,
      (raw.outcome as InquiryOutcome | null) ?? null,
      actor,
    );
    return r.ok ? response({ success: true }) : errorResponse(r.error);
  }
  if (m[2] === 'follow-up' && request.method === 'PATCH') {
    const r = await setFollowUp(
      env.DB,
      id,
      typeof raw.follow_up_at === 'string' ? raw.follow_up_at : null,
      actor,
    );
    return r.ok ? response({ success: true }) : errorResponse(r.error);
  }
  if (m[2] === 'contact' && request.method === 'POST') {
    const r = await markContacted(env.DB, id, actor);
    return r.ok ? response({ success: true }) : errorResponse(r.error);
  }
  if (m[2] === 'notes' && request.method === 'POST') {
    const r = await addNote(env.DB, id, String(raw.body ?? ''), actor);
    return r.ok ? response({ success: true }) : errorResponse(r.error);
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
    const actor: M14Actor = {
      actor: identity.actor,
      role: identity.role,
      requestId: crypto.randomUUID(),
    };
    const startedAt = Date.now();
    try {
      if (
        url.pathname.startsWith('/api/') &&
        !officeMutationOriginAllowed(request, env.OFFICE_ORIGIN)
      ) {
        const denied = errorResponse('forbidden', 403);
        logRequest(env, request, actor, denied.status, startedAt, 'forbidden');
        return denied;
      }
      if (url.pathname.startsWith('/api/')) {
        const first = await m14Api(request, env, actor, url.pathname);
        if (first) {
          logRequest(env, request, actor, first.status, startedAt);
          return first;
        }
        const second = await m13Api(request, env, actor.actor, url.pathname);
        if (second) {
          logRequest(env, request, actor, second.status, startedAt);
          return second;
        }
        const missing = errorResponse('not_found');
        logRequest(env, request, actor, missing.status, startedAt, 'not_found');
        return missing;
      }
      const pageResponse = new Response(page(), {
        headers: new Headers({
          ...Object.fromEntries(headers),
          'Content-Type': 'text/html; charset=utf-8',
        }),
      });
      logRequest(env, request, actor, pageResponse.status, startedAt);
      return pageResponse;
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        const tooLarge = errorResponse('payload_too_large', 413);
        logRequest(env, request, actor, tooLarge.status, startedAt, 'payload_too_large');
        return tooLarge;
      }
      const errorCode = toErrorCode(error);
      logRequest(env, request, actor, 500, startedAt, errorCode);
      return response(
        { error: 'Операция не выполнена', category: 'INTERNAL_ERROR', request_id: actor.requestId },
        500,
      );
    }
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    if (env.ENVIRONMENT === 'production') {
      try {
        const count = await purgeExpired(env.DB);
        console.log(
          JSON.stringify(
            safeLog({
              service: 'office',
              environment: env.ENVIRONMENT,
              release: telemetryContext(env).release,
              route_class: 'scheduled_retention',
              operation: 'RETENTION',
              result: 'SUCCESS',
              duration_ms: 0,
            }),
          ),
        );
        void count;
      } catch (error) {
        console.log(
          JSON.stringify(
            safeLog({
              service: 'office',
              environment: env.ENVIRONMENT,
              release: telemetryContext(env).release,
              route_class: 'scheduled_retention',
              operation: 'RETENTION',
              result: 'FAILURE',
              error_code: 'SCHEDULED_JOB_ERROR',
            }),
          ),
        );
        void error;
      }
    }
    try {
      const snapshot = await collectDailySnapshot(env.DB);
      for (const [metricName, metricValue] of Object.entries(snapshot))
        recordDailySnapshot(
          env.LEARNING,
          telemetryContext(env),
          metricName as Parameters<typeof recordDailySnapshot>[2],
          metricValue,
        );
    } catch (error) {
      console.log(
        JSON.stringify(
          safeLog({
            service: 'office',
            environment: env.ENVIRONMENT,
            release: telemetryContext(env).release,
            route_class: 'scheduled_snapshot',
            operation: 'DAILY_SNAPSHOT',
            result: 'FAILURE',
            error_code: 'SCHEDULED_JOB_ERROR',
          }),
        ),
      );
      void error;
    }
  },
};
